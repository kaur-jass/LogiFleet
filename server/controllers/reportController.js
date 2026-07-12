import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// Helper to compute metrics for a single vehicle
const calculateVehicleMetrics = (vehicle, totalFleetTripsCount) => {
  const completedTrips = vehicle.trips.filter((t) => t.status === "COMPLETED");

  const totalActualDistance = completedTrips.reduce((acc, t) => acc + (t.actualDistance || 0), 0);
  const totalTripFuelLiters = completedTrips.reduce((acc, t) => acc + (t.fuelConsumed || 0), 0);

  // Fallback to sum of fuel logs if trip fuelConsumed is not logged
  const totalFuelLiters = totalTripFuelLiters > 0 
    ? totalTripFuelLiters 
    : vehicle.fuelLogs.reduce((acc, f) => acc + f.liters, 0);

  const fuelEfficiency = totalFuelLiters > 0 
    ? parseFloat((totalActualDistance / totalFuelLiters).toFixed(2)) 
    : 0;

  const totalFuelCost = vehicle.fuelLogs.reduce((acc, f) => acc + f.cost, 0);
  const totalMaintenanceCost = vehicle.maintenanceLogs.reduce((acc, m) => acc + m.cost, 0);
  const operationalCost = totalFuelCost + totalMaintenanceCost;

  const totalRevenue = completedTrips.reduce((acc, t) => acc + (t.revenue || 0), 0);

  const roi = vehicle.acquisitionCost > 0 
    ? parseFloat(((totalRevenue - operationalCost) / vehicle.acquisitionCost).toFixed(4)) 
    : 0;

  const vehicleTripsCount = vehicle.trips.filter(
    (t) => t.status === "COMPLETED" || t.status === "DISPATCHED"
  ).length;

  const utilizationPct = totalFleetTripsCount > 0 
    ? parseFloat(((vehicleTripsCount / totalFleetTripsCount) * 100).toFixed(2)) 
    : 0;

  return {
    fuelEfficiency,
    operationalCost,
    roi,
    utilizationPct,
    totalDistance: totalActualDistance,
    totalRevenue,
  };
};

// GET /api/reports/vehicle/:id
export const getVehicleReport = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: true,
        fuelLogs: true,
        maintenanceLogs: true,
      },
    });

    if (!vehicle) {
      return errorResponse(res, "NOT_FOUND", "Vehicle not found", 404);
    }

    // Get total fleet trips count for utilization calculation
    const totalFleetTripsCount = await prisma.trip.count({
      where: {
        status: { in: ["COMPLETED", "DISPATCHED"] },
      },
    });

    const metrics = calculateVehicleMetrics(vehicle, totalFleetTripsCount);

    return successResponse(res, {
      vehicleId: vehicle.id,
      make: vehicle.name,
      model: vehicle.model,
      licensePlate: vehicle.regNumber,
      fuelEfficiency: metrics.fuelEfficiency,
      operationalCost: metrics.operationalCost,
      roi: metrics.roi,
      utilizationPct: metrics.utilizationPct,
      totalDistance: metrics.totalDistance,
      totalFuelConsumed: vehicle.trips.filter(t => t.status === "COMPLETED").reduce((acc, t) => acc + (t.fuelConsumed || 0), 0) || vehicle.fuelLogs.reduce((acc, f) => acc + f.liters, 0),
      totalFuelCost: vehicle.fuelLogs.reduce((acc, f) => acc + f.cost, 0),
      totalExpenseCost: vehicle.maintenanceLogs.reduce((acc, m) => acc + m.cost, 0),
      totalRevenue: metrics.totalRevenue,
    }, 200);
  } catch (error) {
    console.error("GetVehicleReport Error:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

// GET /api/reports/fleet-summary
export const getFleetSummary = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: { not: "RETIRED" },
      },
      include: {
        trips: true,
        fuelLogs: true,
        maintenanceLogs: true,
      },
    });

    const totalFleetTripsCount = await prisma.trip.count({
      where: {
        status: { in: ["COMPLETED", "DISPATCHED"] },
      },
    });

    const vehicleSummaries = vehicles.map((v) => {
      const metrics = calculateVehicleMetrics(v, totalFleetTripsCount);
      return {
        vehicleId: v.id,
        regNumber: v.regNumber,
        name: v.name,
        model: v.model,
        totalDistance: metrics.totalDistance,
        fuelEfficiency: metrics.fuelEfficiency,
        operationalCost: metrics.operationalCost,
        roi: metrics.roi,
        totalTrips: v.trips.filter(t => t.status === "COMPLETED").length,
      };
    });

    return successResponse(res, { vehicles: vehicleSummaries }, 200);
  } catch (error) {
    console.error("GetFleetSummary Error:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

// GET /api/reports/export.csv
export const exportCsv = async (req, res) => {
  try {
    const { scope, id } = req.query;

    if (scope === "fleet") {
      const vehicles = await prisma.vehicle.findMany({
        where: {
          status: { not: "RETIRED" },
        },
        include: {
          trips: true,
          fuelLogs: true,
          maintenanceLogs: true,
        },
      });

      const totalFleetTripsCount = await prisma.trip.count({
        where: {
          status: { in: ["COMPLETED", "DISPATCHED"] },
        },
      });

      // Construct fleet CSV
      let csvContent = "Vehicle ID,Registration Number,Model,Type,Fuel Efficiency (km/L),Operational Cost ($),ROI (ratio),Total Distance (km),Total Revenue ($)\n";
      
      for (const v of vehicles) {
        const metrics = calculateVehicleMetrics(v, totalFleetTripsCount);
        csvContent += `"${v.id}","${v.regNumber}","${v.model}","${v.type}",${metrics.fuelEfficiency},${metrics.operationalCost},${metrics.roi},${metrics.totalDistance},${metrics.totalRevenue}\n`;
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=fleet_summary.csv");
      return res.status(200).send(csvContent);
    } 

    if (scope === "trips") {
      const trips = await prisma.trip.findMany({
        include: {
          vehicle: true,
          driver: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let csvContent = "Trip ID,Source,Destination,Status,Vehicle Registration,Driver Name,Cargo Weight (kg),Planned Distance (km),Actual Distance (km),Fuel Consumed (L),Revenue (INR),Created At,Dispatched At,Completed At,Cancelled At\n";

      for (const t of trips) {
        csvContent += `"${t.id}","${t.source}","${t.destination}","${t.status}","${t.vehicle ? t.vehicle.regNumber : "N/A"}","${t.driver ? t.driver.name : "N/A"}",${t.cargoWeight},${t.plannedDistance},${t.actualDistance || 0},${t.fuelConsumed || 0},${t.revenue || 0},"${t.createdAt ? t.createdAt.toISOString() : ""}","${t.dispatchedAt ? t.dispatchedAt.toISOString() : ""}","${t.completedAt ? t.completedAt.toISOString() : ""}","${t.cancelledAt ? t.cancelledAt.toISOString() : ""}"\n`;
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=all_trips_report.csv");
      return res.status(200).send(csvContent);
    }

    if (scope === "vehicle") {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
          trips: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!vehicle) {
        return errorResponse(res, "NOT_FOUND", "Vehicle not found", 404);
      }

      // Construct vehicle CSV of trips
      let csvContent = "Trip ID,Source,Destination,Status,Cargo Weight (kg),Planned Distance (km),Actual Distance (km),Fuel Consumed (L),Revenue ($),Dispatched At,Completed At,Cancelled At\n";

      for (const t of vehicle.trips) {
        csvContent += `"${t.id}","${t.source}","${t.destination}","${t.status}",${t.cargoWeight},${t.plannedDistance},${t.actualDistance || 0},${t.fuelConsumed || 0},${t.revenue || 0},"${t.dispatchedAt ? t.dispatchedAt.toISOString() : ""}","${t.completedAt ? t.completedAt.toISOString() : ""}","${t.cancelledAt ? t.cancelledAt.toISOString() : ""}"\n`;
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=vehicle_${vehicle.regNumber}_report.csv`);
      return res.status(200).send(csvContent);
    }
  } catch (error) {
    console.error("ExportCsv Error:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

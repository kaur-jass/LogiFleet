import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// GET /api/dashboard/kpis
export const getDashboardKpis = async (req, res) => {
  try {
    const { type, status, region } = req.query;

    // Formulate filters for vehicles
    const vehicleFilter = {};
    if (type) vehicleFilter.type = type;
    if (status) vehicleFilter.status = status;
    if (region) vehicleFilter.region = region;

    // Calculate active vehicles (status ON_TRIP)
    const activeVehicles = await prisma.vehicle.count({
      where: { ...vehicleFilter, status: "ON_TRIP" },
    });

    // Calculate available vehicles (status AVAILABLE)
    const availableVehicles = await prisma.vehicle.count({
      where: { ...vehicleFilter, status: "AVAILABLE" },
    });

    // Calculate vehicles in shop (status IN_SHOP)
    const vehiclesInMaintenance = await prisma.vehicle.count({
      where: { ...vehicleFilter, status: "IN_SHOP" },
    });

    // Fleet utilization base filter (all non-retired vehicles matching type/region filters)
    const totalUtilizationBaseFilter = { ...vehicleFilter };
    delete totalUtilizationBaseFilter.status;

    const totalNonRetiredVehicles = await prisma.vehicle.count({
      where: {
        ...totalUtilizationBaseFilter,
        status: { not: "RETIRED" },
      },
    });

    const fleetUtilizationPct = totalNonRetiredVehicles > 0
      ? parseFloat(((activeVehicles / totalNonRetiredVehicles) * 100).toFixed(2))
      : 0;

    // Calculate active trips (dispatched status) - filter by vehicle if specified
    const activeTripFilter = { status: "DISPATCHED" };
    if (type || region) {
      activeTripFilter.vehicle = {
        type: type || undefined,
        region: region || undefined,
      };
    }
    const activeTrips = await prisma.trip.count({
      where: activeTripFilter,
    });

    // Calculate pending trips (draft status) - filter by vehicle if specified
    const pendingTripFilter = { status: "DRAFT" };
    if (type || region) {
      pendingTripFilter.vehicle = {
        type: type || undefined,
        region: region || undefined,
      };
    }
    const pendingTrips = await prisma.trip.count({
      where: pendingTripFilter,
    });

    // Calculate drivers on duty (status AVAILABLE or ON_TRIP)
    const driversOnDuty = await prisma.driver.count({
      where: {
        status: { in: ["AVAILABLE", "ON_TRIP"] },
      },
    });

    return successResponse(res, {
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilizationPct,
    }, 200);
  } catch (error) {
    console.error("GetDashboardKpis Error:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

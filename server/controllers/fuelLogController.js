import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// GET /api/fuel-logs
export const getFuelLogs = async (req, res) => {
  try {
    const { vehicleId } = req.query;

    const filter = {};
    if (vehicleId) filter.vehicleId = vehicleId;

    const logs = await prisma.fuelLog.findMany({
      where: filter,
      include: {
        vehicle: {
          select: {
            id: true,
            regNumber: true,
            name: true,
            model: true,
          },
        },
        trip: {
          select: {
            id: true,
            source: true,
            destination: true,
            status: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return successResponse(res, { logs }, 200);
  } catch (error) {
    console.error("GetFuelLogs Error:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

// POST /api/fuel-logs
export const createFuelLog = async (req, res) => {
  try {
    const { vehicleId, tripId, liters, cost, date } = req.body;

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return errorResponse(res, "NOT_FOUND", "Vehicle not found", 404);
    }

    // Verify trip exists if tripId is provided
    if (tripId) {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        return errorResponse(res, "NOT_FOUND", "Trip not found", 404);
      }
    }

    const log = await prisma.fuelLog.create({
      data: {
        vehicleId,
        tripId: tripId || null,
        liters,
        cost,
        date,
      },
    });

    return successResponse(res, { log }, 201);
  } catch (error) {
    console.error("CreateFuelLog Error:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

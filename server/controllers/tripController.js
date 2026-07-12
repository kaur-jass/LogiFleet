import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// GET /api/trips
export const getTrips = async (req, res) => {
  try {
    const filter = req.query; // Filters (status, vehicleId, driverId) are already parsed/validated by Zod middleware

    const trips = await prisma.trip.findMany({
      where: filter,
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(res, { trips }, 200);
  } catch (error) {
    console.error("GetTrips Error:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

// GET /api/trips/:id
export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        fuelLogs: true,
      },
    });

    if (!trip) {
      return errorResponse(res, "NOT_FOUND", "Trip not found", 404);
    }

    return successResponse(res, { trip }, 200);
  } catch (error) {
    console.error("GetTripById Error:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

// POST /api/trips
export const createTrip = async (req, res) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue } = req.body;

    // Validate vehicle max capacity
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return errorResponse(res, "NOT_FOUND", "Vehicle not found", 404);
    }

    if (vehicle.status === "RETIRED") {
      return errorResponse(res, "VALIDATION_ERROR", "Cannot assign a retired vehicle", 400);
    }

    if (cargoWeight > vehicle.maxLoadCapacity) {
      return errorResponse(res, "VALIDATION_ERROR", "cargoWeight exceeds vehicle capacity", 400);
    }

    // Validate driver
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      return errorResponse(res, "NOT_FOUND", "Driver not found", 404);
    }

    const trip = await prisma.trip.create({
      data: {
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeight,
        plannedDistance,
        revenue,
        status: "DRAFT",
      },
    });

    return successResponse(res, { trip }, 201);
  } catch (error) {
    console.error("CreateTrip Error:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

// POST /api/trips/:id/dispatch
export const dispatchTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch Trip details first
      const trip = await tx.trip.findUnique({
        where: { id },
      });

      if (!trip) {
        throw { code: "NOT_FOUND", message: "Trip not found", status: 404 };
      }

      if (trip.status !== "DRAFT") {
        throw { code: "CONFLICT", message: `Cannot dispatch trip in ${trip.status} status`, status: 409 };
      }

      // 2. Perform SELECT FOR UPDATE on vehicle and driver to prevent race conditions
      const lockedVehicles = await tx.$queryRaw`SELECT id FROM vehicles WHERE id = ${trip.vehicleId} FOR UPDATE`;
      if (lockedVehicles.length === 0) {
        throw { code: "NOT_FOUND", message: "Vehicle not found", status: 404 };
      }

      const lockedDrivers = await tx.$queryRaw`SELECT id FROM drivers WHERE id = ${trip.driverId} FOR UPDATE`;
      if (lockedDrivers.length === 0) {
        throw { code: "NOT_FOUND", message: "Driver not found", status: 404 };
      }

      // 3. Retrieve actual state of locked records
      const vehicle = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
      const driver = await tx.driver.findUnique({ where: { id: trip.driverId } });

      // 4. Run dispatch business validations
      if (vehicle.status !== "AVAILABLE") {
        throw { code: "CONFLICT", message: `Vehicle is currently ${vehicle.status}, not AVAILABLE`, status: 409 };
      }

      if (driver.status === "SUSPENDED") {
        throw { code: "FORBIDDEN", message: "Driver is suspended", status: 403 };
      }

      if (driver.status !== "AVAILABLE") {
        throw { code: "CONFLICT", message: `Driver is currently ${driver.status}, not AVAILABLE`, status: 409 };
      }

      if (new Date(driver.licenseExpiry) < new Date()) {
        throw { code: "VALIDATION_ERROR", message: "Driver license is expired", status: 400 };
      }

      if (trip.cargoWeight > vehicle.maxLoadCapacity) {
        throw { code: "VALIDATION_ERROR", message: "cargoWeight exceeds vehicle capacity", status: 400 };
      }

      // 5. Update statuses atomically
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: "DISPATCHED",
          dispatchedAt: new Date(),
        },
      });

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "ON_TRIP" },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: "ON_TRIP" },
      });

      return updatedTrip;
    });

    return successResponse(res, { trip: result }, 200);
  } catch (error) {
    console.error("DispatchTrip Error:", error);
    if (error.code && error.status) {
      return errorResponse(res, error.code, error.message, error.status);
    }
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

// POST /api/trips/:id/complete
export const completeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualDistance, fuelConsumed, finalOdometer, revenue } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
      });

      if (!trip) {
        throw { code: "NOT_FOUND", message: "Trip not found", status: 404 };
      }

      if (trip.status !== "DISPATCHED") {
        throw { code: "CONFLICT", message: `Only dispatched trips can be completed (current: ${trip.status})`, status: 409 };
      }

      // Lock vehicle & driver
      await tx.$queryRaw`SELECT id FROM vehicles WHERE id = ${trip.vehicleId} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM drivers WHERE id = ${trip.driverId} FOR UPDATE`;

      const vehicle = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });

      if (finalOdometer < vehicle.odometer) {
        throw { code: "VALIDATION_ERROR", message: `finalOdometer (${finalOdometer}) cannot be less than current odometer (${vehicle.odometer})`, status: 400 };
      }

      // Update trip
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          actualDistance,
          fuelConsumed,
          revenue: revenue !== undefined ? revenue : trip.revenue,
        },
      });

      // Update vehicle status & odometer
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: "AVAILABLE",
          odometer: finalOdometer,
        },
      });

      // Update driver status
      await tx.driver.update({
        where: { id: trip.driverId },
        data: {
          status: "AVAILABLE",
        },
      });

      return updatedTrip;
    });

    return successResponse(res, { trip: result }, 200);
  } catch (error) {
    console.error("CompleteTrip Error:", error);
    if (error.code && error.status) {
      return errorResponse(res, error.code, error.message, error.status);
    }
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

// POST /api/trips/:id/cancel
export const cancelTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
      });

      if (!trip) {
        throw { code: "NOT_FOUND", message: "Trip not found", status: 404 };
      }

      if (trip.status !== "DRAFT" && trip.status !== "DISPATCHED") {
        throw { code: "CONFLICT", message: `Cannot cancel a trip in ${trip.status} status`, status: 409 };
      }

      // If dispatched, release vehicle & driver back to AVAILABLE
      if (trip.status === "DISPATCHED") {
        await tx.$queryRaw`SELECT id FROM vehicles WHERE id = ${trip.vehicleId} FOR UPDATE`;
        await tx.$queryRaw`SELECT id FROM drivers WHERE id = ${trip.driverId} FOR UPDATE`;

        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: "AVAILABLE" },
        });

        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: "AVAILABLE" },
        });
      }

      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      return updatedTrip;
    });

    return successResponse(res, { trip: result }, 200);
  } catch (error) {
    console.error("CancelTrip Error:", error);
    if (error.code && error.status) {
      return errorResponse(res, error.code, error.message, error.status);
    }
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

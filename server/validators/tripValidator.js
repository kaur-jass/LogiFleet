import { z } from "zod";

export const getTripsQuerySchema = z.object({
  status: z.enum(["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"]).optional(),
  vehicleId: z.string().uuid("Vehicle ID must be a valid UUID").optional(),
  driverId: z.string().uuid("Driver ID must be a valid UUID").optional(),
});

export const createTripSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  vehicleId: z.string().uuid("Vehicle ID must be a valid UUID"),
  driverId: z.string().uuid("Driver ID must be a valid UUID"),
  cargoWeight: z.coerce.number().nonnegative("Cargo weight must be non-negative"),
  plannedDistance: z.coerce.number().positive("Planned distance must be positive"),
  revenue: z.coerce.number().nonnegative("Revenue must be non-negative").optional().default(0),
});

export const completeTripSchema = z.object({
  actualDistance: z.coerce.number().positive("Actual distance must be positive"),
  fuelConsumed: z.coerce.number().nonnegative("Fuel consumed must be non-negative"),
  finalOdometer: z.coerce.number().positive("Final odometer must be positive"),
  revenue: z.coerce.number().nonnegative("Revenue must be non-negative").optional(),
});

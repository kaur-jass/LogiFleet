import { z } from "zod";

export const getFuelLogsQuerySchema = z.object({
  vehicleId: z.string().uuid("Vehicle ID must be a valid UUID").optional(),
});

export const createFuelLogSchema = z.object({
  vehicleId: z.string().uuid("Vehicle ID must be a valid UUID"),
  tripId: z.string().uuid("Trip ID must be a valid UUID").optional().nullable(),
  liters: z.coerce.number().positive("Liters must be positive"),
  cost: z.coerce.number().positive("Cost must be positive"),
  date: z.coerce.date().optional().default(() => new Date()),
});

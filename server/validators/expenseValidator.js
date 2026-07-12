import { z } from "zod";

export const getExpensesQuerySchema = z.object({
  vehicleId: z.string().uuid("Vehicle ID must be a valid UUID").optional(),
  type: z.enum(["TOLL", "MAINTENANCE", "OTHER"]).optional(),
});

export const createExpenseSchema = z.object({
  vehicleId: z.string().uuid("Vehicle ID must be a valid UUID"),
  type: z.enum(["TOLL", "MAINTENANCE", "OTHER"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.coerce.date().optional().default(() => new Date()),
  description: z.string().optional().nullable(),
});

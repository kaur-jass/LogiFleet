import { z } from "zod";

export const getDashboardKpisQuerySchema = z.object({
  type: z.string().optional(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]).optional(),
  region: z.string().optional(),
});

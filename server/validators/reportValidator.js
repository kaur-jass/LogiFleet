import { z } from "zod";

export const exportCsvQuerySchema = z.object({
  scope: z.enum(["fleet", "vehicle"]),
  id: z.string().uuid("Vehicle ID must be a valid UUID").optional(),
}).refine(
  (data) => {
    if (data.scope === "vehicle" && !data.id) {
      return false;
    }
    return true;
  },
  {
    message: "id is required when scope is 'vehicle'",
    path: ["id"],
  }
);

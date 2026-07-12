import express from "express";
import { getFuelLogs, createFuelLog } from "../controllers/fuelLogController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validateBody, validateQuery } from "../middleware/validationMiddleware.js";
import { getFuelLogsQuerySchema, createFuelLogSchema } from "../validators/fuelLogValidator.js";

import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

// All fuel log routes require authentication
router.use(protect);

router.get("/", cacheMiddleware, validateQuery(getFuelLogsQuerySchema), getFuelLogs);

// POST is restricted to DRIVER and FLEET_MANAGER, validated with Zod
router.post("/", authorize("DRIVER", "FLEET_MANAGER"), validateBody(createFuelLogSchema), createFuelLog);

export default router;

import express from "express";
import { getVehicleReport, getFleetSummary, exportCsv } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validateQuery } from "../middleware/validationMiddleware.js";
import { exportCsvQuerySchema } from "../validators/reportValidator.js";

const router = express.Router();

// All report routes require authentication
router.use(protect);

router.get("/vehicle/:id", getVehicleReport);
router.get("/fleet-summary", getFleetSummary);

// CSV export requires FLEET_MANAGER or FINANCIAL_ANALYST roles
router.get("/export.csv", authorize("FLEET_MANAGER", "FINANCIAL_ANALYST"), validateQuery(exportCsvQuerySchema), exportCsv);

export default router;

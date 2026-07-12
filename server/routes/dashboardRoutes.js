import express from "express";
import { getDashboardKpis } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateQuery } from "../middleware/validationMiddleware.js";
import { getDashboardKpisQuerySchema } from "../validators/dashboardValidator.js";

const router = express.Router();

// Dashboard routes require authentication
router.use(protect);

router.get("/kpis", validateQuery(getDashboardKpisQuerySchema), getDashboardKpis);

export default router;

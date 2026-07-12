import express from "express";
import { getExpenses, createExpense } from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validateBody, validateQuery } from "../middleware/validationMiddleware.js";
import { getExpensesQuerySchema, createExpenseSchema } from "../validators/expenseValidator.js";

const router = express.Router();

// All expense routes require authentication
router.use(protect);

// GET is restricted to FLEET_MANAGER and FINANCIAL_ANALYST, validated with Zod
router.get("/", authorize("FLEET_MANAGER", "FINANCIAL_ANALYST"), validateQuery(getExpensesQuerySchema), getExpenses);

// POST is restricted to DRIVER, FLEET_MANAGER, and FINANCIAL_ANALYST, validated with Zod
router.post("/", authorize("DRIVER", "FLEET_MANAGER", "FINANCIAL_ANALYST"), validateBody(createExpenseSchema), createExpense);

export default router;

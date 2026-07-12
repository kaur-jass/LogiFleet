import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// GET /api/expenses
export const getExpenses = async (req, res) => {
  try {
    const { vehicleId, type } = req.query;

    const filter = {};
    if (vehicleId) filter.vehicleId = vehicleId;
    if (type) filter.type = type;

    const expenses = await prisma.expense.findMany({
      where: filter,
      include: {
        vehicle: {
          select: {
            id: true,
            regNumber: true,
            name: true,
            model: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return successResponse(res, { expenses }, 200);
  } catch (error) {
    console.error("GetExpenses Error:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

// POST /api/expenses
export const createExpense = async (req, res) => {
  try {
    const { vehicleId, type, amount, date, description } = req.body;

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return errorResponse(res, "NOT_FOUND", "Vehicle not found", 404);
    }

    const expense = await prisma.expense.create({
      data: {
        vehicleId,
        type,
        amount,
        date,
        description: description || null,
      },
    });

    return successResponse(res, { expense }, 201);
  } catch (error) {
    console.error("CreateExpense Error:", error);
    return errorResponse(res, "INTERNAL_SERVER_ERROR", "Internal Server Error", 500);
  }
};

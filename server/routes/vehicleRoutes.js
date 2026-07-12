import express from "express";

import {
  createVehicle,
  getVehicles,
  getVehicleById,
  getAvailableVehicles,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ==========================
// GET ROUTES
// ==========================

router.get("/", protect, getVehicles);

router.get("/available", protect, getAvailableVehicles);

router.get("/:id", protect, getVehicleById);

// ==========================
// POST ROUTES
// ==========================

router.post(
  "/",
  protect,
  authorize("FLEET_MANAGER"),
  createVehicle
);

// ==========================
// PATCH ROUTES
// ==========================

router.patch(
  "/:id",
  protect,
  authorize("FLEET_MANAGER"),
  updateVehicle
);

// ==========================
// DELETE ROUTES
// ==========================

router.delete(
  "/:id",
  protect,
  authorize("FLEET_MANAGER"),
  deleteVehicle
);

export default router;
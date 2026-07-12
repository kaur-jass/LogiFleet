import express from "express";
import {
  getTrips,
  getTripById,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from "../controllers/tripController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validateBody, validateQuery } from "../middleware/validationMiddleware.js";
import {
  getTripsQuerySchema,
  createTripSchema,
  completeTripSchema,
} from "../validators/tripValidator.js";

import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

// All trip routes require authentication
router.use(protect);

router.get("/", cacheMiddleware, validateQuery(getTripsQuerySchema), getTrips);
router.get("/:id", cacheMiddleware, getTripById);

// Writes are restricted to DRIVER and FLEET_MANAGER roles and validated with Zod schemas
router.post("/", authorize("DRIVER", "FLEET_MANAGER"), validateBody(createTripSchema), createTrip);
router.post("/:id/dispatch", authorize("DRIVER", "FLEET_MANAGER"), dispatchTrip);
router.post("/:id/complete", authorize("DRIVER", "FLEET_MANAGER"), validateBody(completeTripSchema), completeTrip);
router.post("/:id/cancel", authorize("DRIVER", "FLEET_MANAGER"), cancelTrip);

export default router;

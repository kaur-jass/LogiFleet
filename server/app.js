import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import fuelLogRoutes from "./routes/fuelLogRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";

import { invalidateCacheMiddleware } from "./middleware/cacheMiddleware.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

// Invalidate in-memory database cache on all POST/PATCH/DELETE mutations
app.use(invalidateCacheMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/fuel-logs", fuelLogRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/maintenance", maintenanceRoutes); 
app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "ODOO Backend Running",
  });

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`Server running on http://localhost:${PORT}`);

});
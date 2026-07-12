import * as driverService from "../services/driverService.js";
import {
  successResponse,
  errorResponse,
} from "../utils/response.js";

// ==============================
// CREATE DRIVER
// ==============================
export const createDriver = async (req, res) => {
  try {
    const driver = await driverService.createDriver(req.body);

    return successResponse(
      res,
      {
        driver,
      },
      201
    );
  } catch (error) {
    const statusMap = {
      VALIDATION_ERROR: 400,
      CONFLICT: 409,
    };

    return errorResponse(
      res,
      error.code || "INTERNAL_SERVER_ERROR",
      error.message,
      statusMap[error.code] || 500
    );
  }
};

// ==============================
// GET ALL DRIVERS
// ==============================
export const getDrivers = async (req, res) => {
  try {
    const drivers = await driverService.getDrivers(req.query);

    return successResponse(res, {
      drivers,
    });
  } catch (error) {
    return errorResponse(
      res,
      "INTERNAL_SERVER_ERROR",
      error.message,
      500
    );
  }
};

// ==============================
// GET AVAILABLE DRIVERS
// ==============================
export const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await driverService.getAvailableDrivers();

    return successResponse(res, {
      drivers,
    });
  } catch (error) {
    return errorResponse(
      res,
      "INTERNAL_SERVER_ERROR",
      error.message,
      500
    );
  }
};

// ==============================
// GET DRIVER BY ID
// ==============================
export const getDriverById = async (req, res) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);

    return successResponse(res, {
      driver,
    });
  } catch (error) {
    const statusMap = {
      NOT_FOUND: 404,
    };

    return errorResponse(
      res,
      error.code || "INTERNAL_SERVER_ERROR",
      error.message,
      statusMap[error.code] || 500
    );
  }
};

// ==============================
// UPDATE DRIVER
// ==============================
export const updateDriver = async (req, res) => {
  try {
    const driver = await driverService.updateDriver(
      req.params.id,
      req.body, 
      req.user.role
    );

    return successResponse(res, {
      driver,
    });
  } catch (error) {
    const statusMap = {
      NOT_FOUND: 404,
      CONFLICT: 409,
      VALIDATION_ERROR: 400,
      FORBIDDEN: 403,
    };

    return errorResponse(
      res,
      error.code || "INTERNAL_SERVER_ERROR",
      error.message,
      statusMap[error.code] || 500
    );
  }
};
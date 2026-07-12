import prisma from "../lib/prisma.js";

// =========================
// CREATE VEHICLE
// =========================
export const createVehicle = async (data) => {
  const {
    regNumber,
    name,
    model,
    type,
    maxLoadCapacity,
    acquisitionCost,
    region,
  } = data;

    const requiredFields = [
    "regNumber",
    "name",
    "model",
    "type",
    "maxLoadCapacity",
    "acquisitionCost",
    ];

    for (const field of requiredFields) {
    if (
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
    ) {
        const error = new Error(`${field} is required`);
        error.code = "VALIDATION_ERROR";
        throw error;
    }
    }
  // Check duplicate registration number
  const existingVehicle = await prisma.vehicle.findUnique({
    where: {
      regNumber,
    },
  });

  if (existingVehicle) {
    const error = new Error("Registration number already exists");
    error.code = "CONFLICT";
    throw error;
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      regNumber,
      name,
      model,
      type,
      maxLoadCapacity,
      acquisitionCost,
      region,
    },
  });

  return vehicle;
};

// =========================
// GET ALL VEHICLES
// =========================
export const getVehicles = async (query) => {
  const { status, type, region, search } = query;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (region) {
    where.region = region;
  }

  if (search) {
    where.OR = [
      {
        regNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        model: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
         type: {
         contains: search,
         mode: "insensitive",
        },
    },
    ];
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  return vehicles;
};

// =========================
// GET AVAILABLE VEHICLES
// =========================
export const getAvailableVehicles = async () => {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: "AVAILABLE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return vehicles;
};

// =========================
// GET VEHICLE BY ID
// =========================
export const getVehicleById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id,
    },
  });

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  return vehicle;
};

// =========================
// UPDATE VEHICLE
// =========================
export const updateVehicle = async (id, data) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id,
    },
  });

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  // Prevent updating status to protected values
  const blockedStatuses = ["ON_TRIP", "IN_SHOP", "RETIRED"];

    if (data.status && blockedStatuses.includes(data.status)) {
    const error = new Error(
        "Vehicle status can only be changed through Trip or Maintenance."
    );
    error.code = "VALIDATION_ERROR";
    throw error;
    }

  // Check duplicate regNumber
  if (data.regNumber && data.regNumber !== vehicle.regNumber) {
    const existing = await prisma.vehicle.findUnique({
      where: {
        regNumber: data.regNumber,
      },
    });

    if (existing) {
      const error = new Error("Registration number already exists");
      error.code = "CONFLICT";
      throw error;
    }
  }

  const updatedVehicle = await prisma.vehicle.update({
    where: {
      id,
    },
    data,
  });

  return updatedVehicle;
};

// =========================
// SOFT DELETE
// =========================
export const deleteVehicle = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id,
    },
  });

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  const retiredVehicle = await prisma.vehicle.update({
    where: {
      id,
    },
    data: {
      status: "RETIRED",
    },
  });

  return retiredVehicle;
};
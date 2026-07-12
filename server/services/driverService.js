import prisma from "../lib/prisma.js";

// ==============================
// CREATE DRIVER
// ==============================
export const createDriver = async (data) => {
  const existingDriver = await prisma.driver.findUnique({
    where: {
      licenseNumber: data.licenseNumber,
    },
  });

  if (existingDriver) {
    const error = new Error("License number already exists");
    error.code = "CONFLICT";
    throw error;
  }

  return await prisma.driver.create({
    data,
  });
};

// ==============================
// GET ALL DRIVERS
// ==============================
export const getDrivers = async (query) => {
  const { status, licenseCategory, search } = query;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (licenseCategory) {
    where.licenseCategory = licenseCategory;
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        licenseNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        contactNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return await prisma.driver.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==============================
// GET AVAILABLE DRIVERS
// ==============================
export const getAvailableDrivers = async () => {
  return await prisma.driver.findMany({
    where: {
      status: "AVAILABLE",
      licenseExpiry: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==============================
// GET DRIVER BY ID
// ==============================
export const getDriverById = async (id) => {
  const driver = await prisma.driver.findUnique({
    where: {
      id,
    },
  });

  if (!driver) {
    const error = new Error("Driver not found");
    error.code = "NOT_FOUND";
    throw error;
  }

  return driver;
};

// ==============================
// UPDATE DRIVER
// ==============================
export const updateDriver = async (id, data, userRole) => {
  const driver = await prisma.driver.findUnique({
    where: {
      id,
    },
  });

  if (!driver) {
    const error = new Error("Driver not found");
    error.code = "NOT_FOUND";
    throw error;
  }
  // Only Safety Officer can suspend a driver
    if (
    data.status === "SUSPENDED" &&
    userRole !== "SAFETY_OFFICER"
    ) {
    const error = new Error(
        "Only Safety Officer can suspend drivers"
    );
    error.code = "FORBIDDEN";
    throw error;
    }

  // Duplicate License Number Check
  if (
    data.licenseNumber &&
    data.licenseNumber !== driver.licenseNumber
  ) {
    const existingDriver = await prisma.driver.findUnique({
      where: {
        licenseNumber: data.licenseNumber,
      },
    });

    if (existingDriver) {
      const error = new Error("License number already exists");
      error.code = "CONFLICT";
      throw error;
    }
  }

  return await prisma.driver.update({
    where: {
      id,
    },
    data,
  });
};
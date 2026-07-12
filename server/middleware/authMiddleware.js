import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(
        res,
        "UNAUTHORIZED",
        "Missing or invalid authorization header",
        401
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.sub || decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return errorResponse(
      res,
      "UNAUTHORIZED",
      "Invalid or expired token",
      401
    );
  }
};
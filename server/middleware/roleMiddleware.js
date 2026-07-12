import { errorResponse } from "../utils/response.js";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(
        res,
        "UNAUTHORIZED",
        "Authentication required",
        401
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        "FORBIDDEN",
        "You do not have permission to perform this action",
        403
      );
    }

    next();
  };
};
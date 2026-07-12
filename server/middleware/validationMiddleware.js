import { errorResponse } from "../utils/response.js";

export const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body || {});
    if (!result.success) {
      const issues = result.error.issues || result.error.errors || [];
      const message = issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return errorResponse(res, "VALIDATION_ERROR", message, 400);
    }
    // Assign parsed and coerced values back to req.body
    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query || {});
    if (!result.success) {
      const issues = result.error.issues || result.error.errors || [];
      const message = issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return errorResponse(res, "VALIDATION_ERROR", message, 400);
    }
    
    // Mutate the query object properties since we cannot reassign the req.query object reference
    for (const key of Object.keys(req.query)) {
      delete req.query[key];
    }
    Object.assign(req.query, result.data);
    
    next();
  };
};

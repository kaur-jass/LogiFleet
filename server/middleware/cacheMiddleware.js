const cache = new Map();
const CACHE_TTL = 120000; // 2 minutes

// Unique cache key incorporating URL, query params, and user session ID/role
export const getCacheKey = (req) => {
  const userId = req.user ? req.user.id : "anonymous";
  const userRole = req.user ? req.user.role : "none";
  return `${req.method}:${req.baseUrl || ""}${req.path}:${JSON.stringify(req.query)}:${userId}:${userRole}`;
};

// Caching Middleware for GET requests
export const cacheMiddleware = (req, res, next) => {
  if (req.method !== "GET") {
    return next();
  }

  const key = getCacheKey(req);
  const cached = cache.get(key);

  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return res.status(200).json(cached.data);
  }

  // Intercept res.json to capture response
  const originalJson = res.json;
  res.json = function (body) {
    if (res.statusCode === 200) {
      cache.set(key, {
        data: body,
        timestamp: Date.now(),
      });
    }
    return originalJson.call(this, body);
  };

  next();
};

// Clear all active caches
export const invalidateCache = () => {
  cache.clear();
};

// Global interceptor middleware for mutating write operations
export const invalidateCacheMiddleware = (req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    invalidateCache();
  }
  next();
};

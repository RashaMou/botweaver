import express, { Express } from "express";
import routes from "./routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./routes/middleware/errorHandler";
import { createRateLimiter } from "./routes/middleware/rateLimiter";
import { REDIS_CONFIG } from "./config/redis.config";

const app: Express = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(routes);
// Error handling
app.use(errorHandler);
// Rate limiter
app.use(
  createRateLimiter({
    authenticated: {
      windowSize: REDIS_CONFIG.RATE_LIMIT.API.AUTH.duration,
      limit: REDIS_CONFIG.RATE_LIMIT.API.AUTH.points,
    },
    unauthenticated: {
      windowSize: REDIS_CONFIG.RATE_LIMIT.API.GENERAL.duration,
      limit: REDIS_CONFIG.RATE_LIMIT.API.GENERAL.points,
    },
    violations: {
      memoryDuration: REDIS_CONFIG.RATE_LIMIT.VIOLATIONS.MEMORY_DURATION,
    },
    keyPrefixes: {
      ip: REDIS_CONFIG.KEY_PREFIXES.RATE_LIMIT.IP,
    },
  }),
);

export default app;

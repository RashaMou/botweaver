import { Request, Response, NextFunction } from "express";
import redisService from "@/services/redis/redis.service";
import { REDIS_CONFIG } from "@/config/redis.config";
import logger from "@/logger";
import { RateLimitError } from "@/errors/types/ratelimit.errors";
import RATE_LIMIT_ERRORS from "@/errors/constants/ratelimit.constants";
import { asyncHandler } from "./errorHandler";

export const rateLimiter = asyncHandler (async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let redisKey = REDIS_CONFIG.KEY_PREFIXES.RATE_LIMIT.IP + req.ip;
  const accessToken = req.cookies.accessToken;
  let windowSize = REDIS_CONFIG.RATE_LIMIT.API.GENERAL.duration;
  let limit = REDIS_CONFIG.RATE_LIMIT.API.GENERAL.points;

  if (accessToken) {
    if (req.user) {
      redisKey = redisKey + ":" + req.user.id;
    }
    windowSize = REDIS_CONFIG.RATE_LIMIT.API.AUTH.duration;
    limit = REDIS_CONFIG.RATE_LIMIT.API.AUTH.points;
  }

  try {
    // is the user blocked?
    const identifier = redisKey.split(":").slice(2).join(":");
    const violations = await redisService.trackViolations(
      identifier,
      REDIS_CONFIG.RATE_LIMIT.VIOLATIONS.MEMORY_DURATION,
    );

    if (violations.isBlocked) {
      res.set({
        "X-RateLimit-Limit": "0",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": violations.blockExpiry?.toString(),
        "Retry-After": violations.blockExpiry?.toString(),
      });
      const blockTimeInMins =
        REDIS_CONFIG.RATE_LIMIT.VIOLATIONS.MEMORY_DURATION / 3600;
      throw new RateLimitError({
        ...RATE_LIMIT_ERRORS.RATE_LIMIT_EXCEEDED,
        details: `You are temporarily blocked for ${blockTimeInMins} hours`,
      });
    }

    const rateLimit = await redisService.slidingWindowRateLimit(
      redisKey,
      windowSize,
      limit,
    );

    res.set({
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.resetTime.toString(),
    });

    if (rateLimit.isAllowed) {
      return next();
    }

    res.set("Retry-After", rateLimit.resetTime.toString());
    const waitMinutes = Math.max(
      0,
      Math.ceil((rateLimit.resetTime - Date.now() / 1000) / 60),
    );
    throw new RateLimitError({
      ...RATE_LIMIT_ERRORS.RATE_LIMIT_EXCEEDED,
      details: `Rate limit exceeded. Please try again in ${waitMinutes} minutes`,
    });
  } catch (error) {
    logger.error("Rate limiting error:", error);
    throw new RateLimitError(RATE_LIMIT_ERRORS.RATE_LIMIT_SERVICE_ERROR);
  }
};

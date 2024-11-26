import { Request, Response, NextFunction } from "express";
import redisService from "@/services/redis/redis.service";
import logger from "@/logger";
import { RateLimitError } from "@/errors/types/ratelimit.errors";
import RATE_LIMIT_ERRORS from "@/errors/constants/ratelimit.constants";
import { asyncHandler } from "./errorHandler";
import { RateLimitOptions } from "@/services/redis/redis.types";

export const createRateLimiter = (options: RateLimitOptions) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { windowSize, limit } = req.cookies.accessToken
        ? options.authenticated
        : options.unauthenticated;
      let redisKey = options.keyPrefixes.ip + req.ip;

      if (req.user) {
        redisKey = redisKey + ":" + req.user.id;
      }

      try {
        // is the user blocked?
        const identifier = redisKey.split(":").slice(2).join(":");
        const violations = await redisService.trackViolations(
          identifier,
          options.violations.memoryDuration,
        );

        if (violations.isBlocked) {
          res.set({
            "X-RateLimit-Limit": "0",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": violations.blockExpiry?.toString(),
            "Retry-After": violations.blockExpiry?.toString(),
          });
          const blockTimeInMins = options.violations.memoryDuration / 3600;
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
    },
  );
};

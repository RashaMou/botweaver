import Redis, { Pipeline, Result } from "ioredis";
import { REDIS_CONFIG } from "@/config/redis.config";
import logger from "@/logger";
import { RateLimitError } from "@/errors/types/ratelimit.errors";
import RATE_LIMIT_ERRORS from "@/errors/constants/ratelimit.constants";

class RedisService {
  private static instance: RedisService;
  private client: Redis;
  private isConnected: boolean = false;

  private constructor() {
    this.client = new Redis(REDIS_CONFIG.CONNECTION);
    this.setupEventHandlers();
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private setupEventHandlers(): void {
    this.client.on("connect", () => {
      this.isConnected = true;
      logger.info("Redis connected");
    });

    this.client.on("error", (error) => {
      this.isConnected = false;
      logger.error("Redis error:", error);
    });

    this.client.on("reconnecting", () => {
      logger.info("Redis reconnecting...");
    });

    this.client.on("close", () => {
      this.isConnected = false;
      logger.warn("Redis connection closed");
    });
  }

  public async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === "PONG";
    } catch (error) {
      logger.error("Redis ping failed:", error);
      return false;
    }
  }

  public async slidingWindowRateLimit(
    key: string,
    windowSize: number,
    limit: number,
  ): Promise<{ isAllowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - windowSize * 1000; // convert to milliseconds

    try {
      const pipeline = this.client.pipeline() as Pipeline;
      // remove all timestamps older than the window
      pipeline.zremrangebyscore(key, 0, windowStart);
      // add current timestamp to sorted set
      pipeline.zadd(key, now, now.toString());
      // get all entries
      pipeline.zrange(key, 0, -1);
      // set expiration for cleanup
      pipeline.expire(key, windowSize);

      const results = (await pipeline.exec()) as [Error | null, any][];

      if (!results || !results[2] || !results[2][0]) {
        throw new Error("Pipeline execution failed");
      }

      const zrangeResult = results[2][1] as string[];
      if (!Array.isArray(zrangeResult)) {
        throw new Error("Invalid ZRANGE result format");
      }

      const requests = zrangeResult.length;
      const remaining = Math.max(0, limit - requests);
      const oldestRequest = requests > 0 ? parseInt(zrangeResult[0]) : now;
      const resetTime = Math.floor(oldestRequest / 1000) + windowSize;

      return {
        isAllowed: requests <= limit,
        remaining,
        resetTime,
      };
    } catch (error) {
      logger.error("Rate limiting error:", error);

      return {
        isAllowed: false,
        remaining: 0,
        resetTime: Math.floor(now / 1000) + windowSize,
      };
    }
  }

  public async trackViolations(
    identifier: string,
    blockDuration: number,
  ): Promise<{
    violations: number;
    isBlocked: boolean;
    blockExpiry: number | null;
  }> {
    const violationKey = REDIS_CONFIG.RATE_LIMIT.VIOLATIONS + identifier;
    const now = Math.floor(Date.now() / 1000);

    const pipeline = this.client.pipeline() as Pipeline;

    // increment violation count
    pipeline.incr(violationKey);
    // set expiry time if not already set
    pipeline.expire(
      violationKey,
      REDIS_CONFIG.RATE_LIMIT.VIOLATIONS.MEMORY_DURATION,
      "NX",
    );
    // get current violation count
    pipeline.get(violationKey);

    const results = (await pipeline.exec()) as [Error | null, any][];

    if (!results || !results[2] || !results[2][0]) {
      throw new RateLimitError(RATE_LIMIT_ERRORS.VIOLATION_TRACKER);
    }

    const violations = parseInt(results[2][1] as string);

    // if violations threshhold exceeded, set a block
    if (violations >= REDIS_CONFIG.RATE_LIMIT.VIOLATIONS.MAX_VIOLATIONS) {
      const blockKey = REDIS_CONFIG.KEY_PREFIXES.RATE_LIMIT.BLOCKS + identifier;
      await this.client.set(blockKey, now, "EX", blockDuration);

      return {
        violations,
        isBlocked: true,
        blockExpiry: now + blockDuration,
      };
    }

    return {
      violations,
      isBlocked: false,
      blockExpiry: null,
    };
  }

  public getClient(): Redis {
    return this.client;
  }

  public isReady(): boolean {
    return this.isConnected;
  }
}

export default RedisService.getInstance();

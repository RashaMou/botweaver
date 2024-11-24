import { env } from "./env.config";

export const REDIS_CONFIG = {
  CONNECTION: {
    host: env.REDIS_HOST,
    port: 6379,
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times + 50, 2000);
      return delay;
    },
    keepAlive: 5000,
  },

  RATE_LIMIT: {
    VIOLATIONS: {
      MAX_VIOLATIONS: 3,
      MEMORY_DURATION: 86400, // 24h
    },
    API: {
      AUTH: {
        points: 20, // number of requests
        duration: 3600, // time window in seconds (1 hour)
        blockDuration: 900, // block duration in seconds (15 mins)
      },
      GENERAL: {
        points: 60,
        duration: 60,
        blockDuration: 300,
      },
    },
    MESSAGES: {
      GLOBAL: {
        points: 30,
        duration: 1,
        blockDuration: 60,
      },
      PER_BOT: {
        points: 20,
        duration: 1,
        blockDuration: 60,
      },
    },
  },

  KEY_PREFIXES: {
    RATE_LIMIT: {
      IP: "rl:ip:",
      USER: "rl:user:",
      BOT: "rl:bot:",
      GLOBAL: "rl:global:",
      VIOLATIONS: "rl:violations:",
      BLOCKS: "rl:blocks:",
    },
  },
};

export type RedisConfig = typeof REDIS_CONFIG;

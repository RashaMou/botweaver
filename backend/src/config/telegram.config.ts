export const TELEGRAM_CONFIG = {
  // API Settings
  BASE_URL: "https://api.telegram.org/bot",
  TIMEOUT_MS: 10000,

  // Rate Limiting
  RATE_LIMIT: {
    GLOBAL: {
      MESSAGES_PER_SECOND: 30,
      MESSAGES_PER_MINUTE: 120,
      WINDOW_MS: 60000,
    },
    PER_BOT: {
      MESSAGES_PER_SECOND: 20, // Slightly conservative
      MESSAGES_PER_MINUTE: 100,
      WINDOW_MS: 60000,
    },
  },

  // Retry Settings
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_BACKOFF_MS: 1000,
    MAX_BACKOFF_MS: 10000,
    RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
    JITTER_MAX_MS: 100, // Add randomness to prevent thundering herd
  },

  // Webhook Settings
  WEBHOOK: {
    MAX_CONNECTIONS: 100,
    ALLOWED_UPDATES: ["message", "callback_query"], // Optimize webhook traffic
    SECRET_TOKEN_LENGTH: 32,
  },
};

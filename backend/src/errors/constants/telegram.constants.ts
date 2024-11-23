const TELEGRAM_ERRORS = {
  TOKEN_MISSING: {
    error: "Configuration Error",
    details: "Telegram bot token is required",
    statusCode: 500,
  },
  CHAT_ID_MISSING: {
    error: "Validation Error",
    details: "Chat ID is required for sending messages",
    statusCode: 400,
  },
  MESSAGE_TEXT_MISSING: {
    error: "Validation Error",
    details: "Message text is required",
    statusCode: 400,
  },
  RATE_LIMIT_EXCEEDED: {
    error: "Rate Limit Error",
    details: "Telegram API rate limit exceeded. Please try again later",
    statusCode: 429,
  },
  API_ERROR: {
    error: "API Error",
    details: "Failed to communicate with Telegram API",
    statusCode: 500,
  },
  WEBHOOK_ERROR: {
    error: "Configuration Error",
    details: "Failed to set up Telegram webhook",
    statusCode: 500,
  },
  WEBHOOK_URL_NOT_SET: {
    error: "Configuration Error",
    details: "Webhook URL is not configured",
    statusCode: 500,
  },
  INVALID_TOKEN: {
    error: "Authentication Error",
    details: "The provided bot token is invalid",
    statusCode: 401,
  },
  BOT_BLOCKED: {
    error: "Permission Error",
    details: "Bot was blocked by the user",
    statusCode: 403,
  },
  RETRY_FAILED: {
    error: "API Error",
    details: "Maximum retry attempts reached for Telegram API request",
    statusCode: 500,
  },
  WEBHOOK_VALIDATION: {
    error: "Validation Error",
    details: "Invalid webhook request received",
    statusCode: 400,
  },
  MESSAGE_TOO_LONG: {
    error: "Validation Error",
    details: "Message exceeds maximum length allowed by Telegram",
    statusCode: 400,
  },
  MEDIA_TYPE_INVALID: {
    error: "Validation Error",
    details: "Unsupported media type for Telegram message",
    statusCode: 400,
  },
};

export default TELEGRAM_ERRORS;

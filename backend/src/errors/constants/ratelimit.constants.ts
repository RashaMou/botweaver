const RATE_LIMIT_ERRORS = {
  RATE_LIMIT_EXCEEDED: {
    error: "Rate limit exceeded",
    details: "Too many requests. Please try again later",
    statusCode: 429,
  },
  VIOLATION_TRACKER: {
    error: "Failed to track violation",
    details: "Failed to track violation",
    statusCode: 500,
  },
  RATE_LIMIT_SERVICE_ERROR: {
    error: "Rate Limiting Error",
    details: "Unable to process request due to rate limiting service error",
    statusCode: 500,
  },
};

export default RATE_LIMIT_ERRORS;

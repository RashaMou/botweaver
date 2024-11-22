const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    error: "Authentication failed",
    details: "Invalid email or password",
    statusCode: 401,
  },
  INVALID_REFRESH_TOKEN: {
    error: "Authentication failed",
    details: "Invalid refresh token",
    statusCode: 401,
  },
  INVALID_TOKEN_FORMAT: {
    error: "Authentication failed",
    details: "Invalid refresh token format",
    statusCode: 401,
  },
  TOKEN_EXPIRED: {
    error: "Session expired",
    details: "Refresh token expired",
    statusCode: 401,
  },
  TOKEN_REUSE_DETECTED: {
    error: "Security alert",
    details: "Security issue detected. Please login again",
    statusCode: 401,
  },
  LOGIN_FAILED: {
    error: "Authentication failed",
    details: "Failed to process login. Please try again",
    statusCode: 500,
  },
  NOT_AUTHENTICATED: {
    error: "Authentication required",
    details: "Not authenticated",
    statusCode: 401,
  },
  LOGOUT_FAILED: {
    error: "Authentication failed",
    details: "Failed to process logout",
    statusCode: 500,
  },
};

export default AUTH_ERRORS;

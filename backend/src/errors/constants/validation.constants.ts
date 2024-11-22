const VALIDATION_ERRORS = {
  CREDENTIALS: {
    error: "Missing required information",
    details: "Email and password are required",
    statusCode: 400,
  },
  EMAIL_FORMAT: {
    error: "Invalid input",
    details: "Invalid email format",
    statusCode: 400,
  },
  PASSWORD_LENGTH: {
    error: "Invalid input",
    details: "Password must be at least 8 characters",
    statusCode: 400,
  },
  USER_EXISTS: {
    error: "Registration failed",
    details: "User already exists. Please sign in",
    statusCode: 400,
  },
  REFRESH_TOKEN_REQUIRED: {
    error: "Missing required information",
    details: "Refresh token is required",
    statusCode: 400,
  },
};

export default VALIDATION_ERRORS;

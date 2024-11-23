import { Request, Response, NextFunction, RequestHandler } from "express";
import { env } from "@/config/env.config";
import jwt from "jsonwebtoken";
import logger from "@/logger";
import { AuthenticationError } from "@/errors/types/auth.errors";
import { ValidationError } from "@/errors/types/base.errors";
import { MongoServerError } from "mongodb";

type AsyncHandlerFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void | Response>;

export const asyncHandler = (fn: AsyncHandlerFunction): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error: unknown) {
      // Custom Error Handling
      if (error instanceof AuthenticationError) {
        res.status(error.statusCode).json({
          error: error.error,
          details: error.message,
        });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(error.statusCode).json({
          error: error.error,
          details: error.message,
        });
        return;
      }

      // MongoDB Errors
      if (isMongoServerError(error) && error.code === 11000) {
        res.status(400).json({ error: "This email is already registered" });
        return;
      }

      if (isValidationError(error)) {
        res.status(400).json({ error: error.error, details: error.details });
        return;
      }

      // JWT errors
      if (error instanceof jwt.JsonWebTokenError) {
        const status = error.name === "TokenExpiredError" ? 401 : 401;
        res.status(status).json({ error: error.message });
        return;
      }

      // Log and Fallback Error Response
      logError(error);

      const errorResponse =
        env.NODE_ENV === "production"
          ? { error: "An unexpected error occurred. Please try again later." }
          : { error: error instanceof Error ? error.message : String(error) };
      res.status(500).json(errorResponse);
      return;
    }
  };
};

// Utility Functions
const isMongoServerError = (error: unknown): error is MongoServerError =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  error.name === "MongoServerError";

const isValidationError = (error: unknown): error is ValidationError =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  error.name === "ValidationError";

const logError = (error: unknown) => {
  if (error instanceof Error) {
    logger.error(`Error: ${error.message}`, error.stack);
  } else {
    logger.error(`Unknown error: ${String(error)}`);
  }
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    error:
      env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};

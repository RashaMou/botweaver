import { Request, Response, NextFunction } from "express";
import { AuthenticationError } from "@/errors/types/auth.errors";
import { env } from "@/config/env.config";
import jwt from "jsonwebtoken";
import AUTH_ERRORS from "@/errors/constants/auth.constants";

interface UserPayload {
  id: string;
  email: string;
  createdAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Get access token from cookie
  // 2. Verify the token
  // 3. If valid, attach user info to req object
  // 4. If invalid, return 401 unauthorized
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken)
      throw new AuthenticationError(AUTH_ERRORS.NOT_AUTHENTICATED);

    const payload = jwt.verify(accessToken, env.JWT_SECRET) as UserPayload;

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

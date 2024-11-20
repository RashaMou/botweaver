import { Request, Response, NextFunction } from "express";
import { AuthenticationError } from "@/errors/auth.errors";
import jwt from "jsonwebtoken";

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
    if (!accessToken) throw new AuthenticationError("Not authenticated", 401);

    const payload = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!,
    ) as UserPayload;

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

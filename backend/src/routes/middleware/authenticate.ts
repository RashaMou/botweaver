import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Get access token from cookie
  // 2. Verify the token
  // 3. If valid, attach user info to req object
  // 4. If invalid, return 401 unauthorized

  next();
};

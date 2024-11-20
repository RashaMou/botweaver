import { Router, Request, Response } from "express";
import { asyncHandler } from "@/routes/middleware/errorHandler";
import isEmail from "validator/es/lib/isEmail";
import { User } from "@/models/user.model";
import { tokenUtils } from "@/utils/token.utils";
import { jwtConfig } from "@/config/jwt.config";
import {
  accessTokenCookieConfig,
  refreshTokenCookieConfig,
} from "@/config/cookie.config";
import logger from "@/logger";
import { AuthenticationError } from "@/errors/auth.errors";
import { ValidationError } from "@/errors/base.errors";

const router = Router();

router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    // Removed NextFunction since we're not using it
    if (!req.body.email || !req.body.password) {
      throw new ValidationError("Email and password are required", 400);
    }
    // validate email
    const isValidEmail = isEmail(req.body.email);
    if (!isValidEmail) throw new ValidationError("Invalid email format", 400);

    // validate password
    if (req.body.password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters", 400);
    }

    // check if user exists
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      throw new ValidationError("User already exists. Please sign in", 400);
    }

    // create new user, tokens, and set cookies
    const newUser = await User.create({
      email: req.body.email.toLowerCase(),
      password: req.body.password.trim(),
    });

    const newAccessToken = tokenUtils.generateAccessToken(newUser.id);
    const { token, family, version } = tokenUtils.generateRefreshToken(
      newUser.id,
    );

    newUser.refreshTokens.push({
      family,
      version,
      expiresAt: new Date(Date.now() + jwtConfig.refreshToken.expiresInMs),
      userId: newUser.id,
    });

    await newUser.save();

    res.cookie("accessToken", newAccessToken, accessTokenCookieConfig);
    res.cookie("refreshToken", token, refreshTokenCookieConfig);

    return res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
      message: "New user created",
    });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    // 1. validate email/password input
    // 2. find user in db
    // 3. compare password hash
    // 4. generate new access and refresh tokens
    // 5. store new refresh token in db (invalidating old ones)
    // 6. set httpOnly cookies with tokens
    // 7. return user info and success message
  }),
);

router.post(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    // 1. extract refresh token from cookies
    // 2. validate refresh token authenticity
    // 3. check if refresh token exists and is valid in db
    // 4. generate new access token (and optionally new refresh token)
    // 5. if generating new refresh token:
    //    - invalidate old refresh token in db
    //    - store new refresh token
    //    - update cookie
    // 6. otherwise, just update access token cookie
    // 7. return success response
  }),
);

export default router;

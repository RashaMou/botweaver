import { Router, Request, Response } from "express";
import { asyncHandler } from "@/routes/middleware/errorHandler";
import validator from "validator";
import { User } from "@/models/user.model";
import { tokenUtils } from "@/utils/token.utils";
import { jwtConfig } from "@/config/jwt.config";
import {
  accessTokenCookieConfig,
  refreshTokenCookieConfig,
} from "@/config/cookie.config";
import logger from "@/logger";
import { AuthenticationError } from "@/errors/types/auth.errors";
import { ValidationError } from "@/errors/types/base.errors";
import AUTH_ERRORS from "@/errors/constants/auth.constants";
import VALIDATION_ERRORS from "@/errors/constants/validation.constants";

const router = Router();

router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.email || !req.body.password) {
      throw new ValidationError(VALIDATION_ERRORS.CREDENTIALS);
    }
    // validate email
    const isValidEmail = validator.isEmail(req.body.email);
    if (!isValidEmail)
      throw new ValidationError(VALIDATION_ERRORS.EMAIL_FORMAT);

    // validate password
    if (req.body.password.length < 8) {
      throw new ValidationError(VALIDATION_ERRORS.PASSWORD_LENGTH);
    }

    // check if user exists
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      throw new ValidationError(VALIDATION_ERRORS.USER_EXISTS);
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
    if (!req.body.email || !req.body.password) {
      throw new ValidationError(VALIDATION_ERRORS.CREDENTIALS);
    }

    const isValidEmail = validator.isEmail(req.body.email);

    if (!isValidEmail)
      throw new ValidationError(VALIDATION_ERRORS.EMAIL_FORMAT);

    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (!user) throw new AuthenticationError(AUTH_ERRORS.INVALID_CREDENTIALS);

    const isValidPassword = await user.comparePassword(
      req.body.password.trim(),
    );

    if (!isValidPassword)
      throw new AuthenticationError(AUTH_ERRORS.INVALID_CREDENTIALS);

    try {
      const newAccessToken = tokenUtils.generateAccessToken(user.id);
      const { token, family, version } = tokenUtils.generateRefreshToken(
        user.id,
      );

      user.refreshTokens = [];

      user.refreshTokens.push({
        family,
        version,
        expiresAt: new Date(Date.now() + jwtConfig.refreshToken.expiresInMs),
        userId: user.id,
      });

      user.lastLogin = new Date();

      await user.save();
      res.cookie("accessToken", newAccessToken, accessTokenCookieConfig);
      res.cookie("refreshToken", token, refreshTokenCookieConfig);

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
        message: "Login successful",
      });
    } catch (error) {
      throw new AuthenticationError(AUTH_ERRORS.LOGIN_FAILED);
    }
  }),
);

router.post(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    // 1. extract refresh token from cookies
    // 2. validate refresh token authenticity
    // 3. check if refresh token exists and is valid in db
    // 3a. if token was already used, invalidate entire token family (reuse
    // attack)
    // 3b. log security event and force re-authentication
    // 4. generate new access token
    // 5. generate new refresh token:
    //    - invalidate old refresh token in db
    //    - store new refresh token
    //    - update cookie
    // 6. return success response

    if (!req.body.refreshToken) {
      throw new ValidationError(VALIDATION_ERRORS.REFRESH_TOKEN_REQUIRED);
    }

    let tokenData;
    try {
      tokenData = tokenUtils.verifyRefreshToken(req.body.refreshToken);
    } catch {
      throw new AuthenticationError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    const { version, family, expiresAt } = tokenData;
    if (!version || !family || !expiresAt) {
      throw new AuthenticationError(AUTH_ERRORS.INVALID_TOKEN_FORMAT);
    }

    if (new Date(expiresAt) <= new Date()) {
      throw new AuthenticationError(AUTH_ERRORS.TOKEN_EXPIRED);
    }

    const user = await User.findOne({
      refreshTokens: {
        $elemMatch: {
          family,
          version,
          expiresAt: { $gt: new Date() },
        },
      },
    });

    if (!user) {
      throw new AuthenticationError(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }

    // Token reuse detection
    const tokenFamily = user.refreshTokens.filter((t) => t.family === family);
    const latestVersion = Math.max(
      ...tokenFamily.map((t) => parseInt(t.version)),
    );

    if (parseInt(version) < latestVersion) {
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.family !== family,
      );
      await user.save();

      logger.warn(`Token reuse detected for user ${user.id}`);
      tokenUtils.clearAuthCookies(res);

      throw new AuthenticationError(AUTH_ERRORS.TOKEN_REUSE_DETECTED);
    }

    // Generate new tokens
    const newAccessToken = tokenUtils.generateAccessToken(user.id);
    const newRefreshToken = tokenUtils.generateRefreshToken(user.id);

    user.refreshTokens = [
      {
        family: newRefreshToken.family,
        version: newRefreshToken.version,
        expiresAt: new Date(Date.now() + jwtConfig.refreshToken.expiresInMs),
        userId: user.id,
      },
    ];

    await user.save();

    res.cookie("accessToken", newAccessToken, accessTokenCookieConfig);
    res.cookie("refreshToken", newRefreshToken.token, refreshTokenCookieConfig);

    return res.json({ success: true });
  }),
);

router.post(
  "/logout",
  asyncHandler(async (req: Request, res: Response) => {
    // 1. verify user is authenticated (check access token in cookies)
    // 2. clear refresh tokens from DB
    // 3. clear both cookies (access and refresh tokens)
    // 4. return success message
    const accessToken = req.cookies.accessToken;

    if (!accessToken)
      throw new AuthenticationError(AUTH_ERRORS.NOT_AUTHENTICATED);

    try {
      const decoded = tokenUtils.verifyAccessToken(accessToken);
      const user = await User.findById(decoded.userId);

      if (user) {
        user.refreshTokens = [];
        await user.save();
      }
    } catch (error) {
      throw new AuthenticationError(AUTH_ERRORS.LOGOUT_FAILED);
    }

    tokenUtils.clearAuthCookies(res);

    return res.status(200).json({
      message: "Logout successful",
    });
  }),
);

export default router;

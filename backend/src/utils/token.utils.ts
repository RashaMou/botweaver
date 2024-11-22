import jwt from "jsonwebtoken";
import { jwtConfig } from "@/config/jwt.config";
import { TokenError } from "@/errors/types/token.errors";
import { Response } from "express";

interface AccessTokenPayload {
  userId: string;
}

export interface RefreshTokenPayload extends AccessTokenPayload {
  version: string; // for token rotation
  family: string; // to group related refresh tokens
  expiresAt: Date;
}

export const tokenUtils = {
  generateAccessToken(userId: string): string {
    try {
      return jwt.sign(
        { userId } as AccessTokenPayload,
        jwtConfig.accessToken.secret,
        { expiresIn: jwtConfig.accessToken.expiresIn },
      );
    } catch (error) {
      throw new TokenError("Failed to generate access token");
    }
  },

  clearAuthCookies(res: Response) {
    const clearCookieConfig = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };
    res.clearCookie("accessToken", clearCookieConfig);
    res.clearCookie("refreshToken", clearCookieConfig);
  },

  generateRefreshToken(
    userId: string,
    family?: string,
  ): {
    token: string;
    family: string;
    version: string;
  } {
    try {
      // Generate new family if not provided (new login)
      const tokenFamily = family || crypto.randomUUID();
      const tokenVersion = crypto.randomUUID();

      const expiresAt = new Date(
        Date.now() + jwtConfig.refreshToken.expiresInMs,
      );
      const token = jwt.sign(
        {
          userId,
          version: tokenVersion,
          family: tokenFamily,
          expiresAt,
        } as RefreshTokenPayload,
        jwtConfig.refreshToken.secret,
        { expiresIn: jwtConfig.refreshToken.expiresIn },
      );

      return {
        token,
        family: tokenFamily,
        version: tokenVersion,
      };
    } catch (error) {
      throw new TokenError("Failed to generate refresh token");
    }
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(
        token,
        jwtConfig.accessToken.secret,
      ) as AccessTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenError("Access token expired");
      }
      throw new TokenError("Invalid access token");
    }
  },

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(
        token,
        jwtConfig.refreshToken.secret,
      ) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenError("Refresh token expired");
      }
      throw new TokenError("Invalid refresh token");
    }
  },

  // Utility method to extract token from authorization header
  extractTokenFromHeader(authHeader?: string): string {
    if (!authHeader?.startsWith("Bearer ")) {
      throw new TokenError("Invalid authorization header");
    }
    return authHeader.split(" ")[1];
  },
};

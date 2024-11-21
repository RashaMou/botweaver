import { tokenUtils } from "../../src/utils/token.utils.js";
import { jest } from "@jest/globals";
import { Response } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../src/config/jwt.config";

describe("Token Utilities", () => {
  describe("Access Token", () => {
    const userId = "DoloursPrice";

    it("should generate a valid access token", () => {
      const token = tokenUtils.generateAccessToken(userId);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should verify a valid access token", () => {
      const token = tokenUtils.generateAccessToken(userId);
      const verifiedUserId = tokenUtils.verifyAccessToken(token);
      expect(verifiedUserId).toHaveProperty("userId", userId);
    });

    it("should throw on invalid access token", () => {
      expect(() => tokenUtils.verifyAccessToken("1235")).toThrow(
        "Invalid access token",
      );
    });

    it("should throw on expired access token", () => {
      const expiredToken = jwt.sign(
        { userId: "123", exp: Math.floor(Date.now() / 1000) - 3600 },
        jwtConfig.accessToken.secret,
      );

      expect(() => tokenUtils.verifyAccessToken(expiredToken)).toThrow(
        "Access token expired",
      );
    });
  });

  describe("Refresh Token", () => {
    const userId = "MarianPrice";

    it("should generate a refresh token with new family", () => {
      const token1 = tokenUtils.generateRefreshToken(userId);
      const token2 = tokenUtils.generateRefreshToken(userId);

      expect(token1.family).not.toBe(token2.family);
    });

    it("should generate a refresh token with provided family", () => {
      const token1 = tokenUtils.generateRefreshToken(userId);
      const token2 = tokenUtils.generateRefreshToken(userId, token1.family);

      expect(token1.family).toBe(token2.family);
    });

    it("should verify a valid refresh token", () => {
      const token = tokenUtils.generateRefreshToken(userId);
      const { version, family, expiresAt } = tokenUtils.verifyRefreshToken(
        token.token,
      );

      expect(token.version).toBe(version);
      expect(token.family).toBe(family);

      const expiresAtDate = new Date(expiresAt);
      expect(expiresAtDate > new Date()).toBe(true);
    });

    it("should throw on invalid refresh token", () => {
      expect(() => tokenUtils.verifyRefreshToken("1235")).toThrow(
        "Invalid refresh token",
      );
    });

    it("should throw on expired refresh token", () => {
      const expiredToken = jwt.sign(
        { userId: "123", exp: Math.floor(Date.now() / 1000) - 3600 },
        jwtConfig.refreshToken.secret,
      );

      expect(() => tokenUtils.verifyRefreshToken(expiredToken)).toThrow(
        "Refresh token expired",
      );
    });
  });

  describe("Cookie Management", () => {
    it("should clear auth cookies from response", () => {
      const res = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      tokenUtils.clearAuthCookies(res);

      expect(res.clearCookie).toHaveBeenCalledTimes(2);
      expect(res.clearCookie).toHaveBeenCalledWith("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    });
  });
});

import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/models/user.model.js";
import { verify } from "@node-rs/bcrypt";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../src/config/jwt.config";

describe("Authentication Routes", () => {
  describe("POST /register", () => {
    const testUser = {
      email: "test@example.com",
      password: "password123",
    };

    let response: any;

    beforeEach(async () => {
      response = await request(app).post("/auth/register").send(testUser);
    });

    it("should register a new user", async () => {
      expect(response.body).toHaveProperty("message", "New user created");
      expect(response.body.user).toHaveProperty("email", testUser.email);
    });

    it("should save user and password in database", async () => {
      const savedUser = await User.findOne({ email: testUser.email });
      expect(savedUser).toBeDefined();
      expect(savedUser!.email).toBe(testUser.email);
    });

    it("should set proper authentication cookies after registration", async () => {
      const cookieHeader = response.headers["set-cookie"];
      expect(cookieHeader).toBeDefined();
      const cookies = Array.isArray(cookieHeader)
        ? cookieHeader
        : [cookieHeader];
      expect(
        cookies.some((cookie) => cookie.includes("accessToken")),
      ).toBeTruthy();
      expect(
        cookies.some((cookie) => cookie.includes("refreshToken")),
      ).toBeTruthy();
    });

    it("should store password as a hash in the database", async () => {
      const user = await User.findOne({ email: "test@example.com" });
      expect(await verify(testUser.password, user!.password)).toBeTruthy();
    });

    it("should store refresh token information in user document", async () => {
      await request(app)
        .post("/auth/register")
        .send({ email: "test@example.com", password: "password123" });

      const user = await User.findOne({ email: "test@example.com" });

      expect(user!.refreshTokens).toHaveLength(1);
      expect(user!.refreshTokens[0]).toMatchObject({
        family: expect.any(String),
        version: expect.any(String),
        expiresAt: expect.any(Date),
      });
    });

    it("should fail if email is missing", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ email: "", password: "12345678" });

      expect(response.body).toMatchObject({
        error: "Missing required information",
        details: "Email and password are required",
      });
    });

    it("should fail if password is missing", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ email: "test@test.com", password: "" });

      expect(response.body).toMatchObject({
        error: "Missing required information",
        details: "Email and password are required",
      });
    });

    it("should fail if email is invalid", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ email: "test@test", password: "123454898" });

      expect(response.body).toMatchObject({
        details: "Invalid email format",
        error: "Invalid input",
      });
    });

    it("should fail if password is too short", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ email: "test@test.com", password: "123" });

      expect(response.body).toMatchObject({
        details: "Password must be at least 8 characters",
        error: "Invalid input",
      });
    });

    it("should fail if user already exists", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({ email: "test@example.com", password: "123456789" });

      expect(response.body).toMatchObject({
        details: "User already exists. Please sign in",
        error: "Registration failed",
      });
    });
  });

  describe("POST /login", () => {
    const testUser = {
      email: "test@example.com",
      password: "password123",
    };

    let response: any;

    beforeEach(async () => {
      await request(app).post("/auth/register").send(testUser);
      response = await request(app).post("/auth/login").send(testUser);
    });

    it("should log in an existing user with valid credentials", async () => {
      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body.user).toHaveProperty("email", testUser.email);
    });

    it("should fail if email is missing", async () => {
      response = await request(app)
        .post("/auth/login")
        .send({ email: "", password: "password123" });

      expect(response.body).toMatchObject({
        error: "Missing required information",
        details: "Email and password are required",
      });
    });

    it("should fail if password is missing", async () => {
      response = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "" });

      expect(response.body).toMatchObject({
        error: "Missing required information",
        details: "Email and password are required",
      });
    });

    it("should fail if email is invalid", async () => {
      response = await request(app)
        .post("/auth/login")
        .send({ email: "test@com", password: "password123" });

      expect(response.body).toMatchObject({
        details: "Invalid email format",
        error: "Invalid input",
      });
    });

    it("should fail if credentials are incorrect", async () => {
      response = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "password12334" });

      expect(response.body).toMatchObject({
        details: "Invalid email or password",
        error: "Authentication failed",
      });
    });
  });

  describe("POST /refresh", () => {
    const testUser = {
      email: "test@example.com",
      password: "password123",
    };

    let response: any;
    let userId: string;
    let refreshToken: string;

    beforeEach(async () => {
      await request(app).post("/auth/register").send(testUser);
      const loginResponse = await request(app)
        .post("/auth/login")
        .send(testUser);

      userId = loginResponse.body.userId;

      const cookieHeader = loginResponse.headers["set-cookie"];
      const cookies = Array.isArray(cookieHeader)
        ? cookieHeader
        : [cookieHeader];

      const refreshCookie = cookies.filter((cookie: string) =>
        cookie.includes("refreshToken"),
      )[0];

      refreshToken = refreshCookie.split(";")[0].split("=")[1];

      response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken });
    });

    it("should refresh tokens for a valid refresh token", async () => {
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });

      const newCookies = Array.isArray(response.headers["set-cookie"])
        ? response.headers["set-cookie"]
        : [response.headers["set-cookie"]];

      expect(
        newCookies.some((c: string) => c.includes("accessToken")),
      ).toBeTruthy();
      expect(
        newCookies.some((c: string) => c.includes("refreshToken")),
      ).toBeTruthy();
    });

    it("should fail if refresh token is missing", async () => {
      response = await request(app).post("/auth/refresh").send();

      expect(response.body).toMatchObject({
        details: "Refresh token is required",
        error: "Missing required information",
      });
    });

    it("should fail if refresh token is invalid", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: "blah" });

      expect(response.body).toMatchObject({
        details: "Invalid refresh token",
        error: "Authentication failed",
      });
    });

    it("should fail if refresh token is expired", async () => {
      const expiredToken = jwt.sign(
        { userId: userId, exp: Math.floor(Date.now() / 1000) - 3600 },
        jwtConfig.refreshToken.secret,
      );

      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: expiredToken });

      expect(response.body).toMatchObject({
        details: "Invalid refresh token",
        error: "Authentication failed",
      });
    });

    it("should detect token reuse and invalidate token family", async () => {
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);

      const reusedRefreshResponse = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken });

      expect(reusedRefreshResponse.status).toBe(401);
      expect(reusedRefreshResponse.body).toMatchObject({
        details: "Invalid refresh token",
        error: "Authentication failed",
      });

      const user = await User.findOne({ email: "test@example.com" });
      const tokenFamily = user!.refreshTokens.filter(
        (t) => t.family === response.body.family,
      );

      expect(tokenFamily).toHaveLength(0);
    });
  });

  describe("POST /logout", () => {
    const testUser = {
      email: "test@example.com",
      password: "password123",
    };

    let accessToken: string;

    beforeEach(async () => {
      await request(app).post("/auth/register").send(testUser);
      const loginResponse = await request(app)
        .post("/auth/login")
        .send(testUser);

      const cookieHeader = loginResponse.headers["set-cookie"];
      const cookies = Array.isArray(cookieHeader)
        ? cookieHeader
        : [cookieHeader];

      const accessTokenCookie = cookies.find((cookie) =>
        cookie.includes("accessToken"),
      );
      accessToken = accessTokenCookie?.split(";")[0].split("=")[1];
    });

    it("should log out the user and clear auth cookies", async () => {
      const res = await request(app)
        .post("/auth/logout")
        .set("Cookie", [`accessToken=${accessToken}`]); // Set accessToken cookie

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: "Logout successful",
      });

      const clearedCookies = res.headers["set-cookie"];
      const cookies = Array.isArray(clearedCookies)
        ? clearedCookies
        : [clearedCookies];

      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) => cookie.includes("accessToken=;")),
      ).toBeTruthy();
      expect(
        cookies.some((cookie: string) => cookie.includes("refreshToken=;")),
      ).toBeTruthy();

      const user = await User.findOne({ email: testUser.email });
      expect(user).not.toBeNull();
      expect(user!.refreshTokens).toHaveLength(0);
    });

    it("should fail if user is not authenticated", async () => {
      const res = await request(app).post("/auth/logout");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        error: "Authentication required",
        details: "Not authenticated",
      });
    });
  });
});

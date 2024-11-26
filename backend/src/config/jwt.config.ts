import { env } from "./env.config";

interface JWTConfig {
  accessToken: {
    secret: string;
    expiresIn: string | number;
    expiresInMs: number; // for calculating expiresAt
  };
  refreshToken: {
    secret: string;
    expiresIn: string | number;
    expiresInMs: number;
  };
}

const jwtConfig: JWTConfig = {
  accessToken: {
    secret: env.JWT_SECRET || "keepitsecretkeepitsafe",
    expiresIn: "15m",
    expiresInMs: 900000,
  },
  refreshToken: {
    secret: env.JWT_SECRET || "keepitrefreshkeepitsafe",
    expiresIn: "7d",
    expiresInMs: 604800000,
  },
};

export { jwtConfig, JWTConfig };

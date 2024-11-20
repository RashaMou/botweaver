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
    secret: process.env.JWT_ACCESS_SECRET || "keepitsecretkeepitsafe",
    expiresIn: "15m",
    expiresInMs: 900000,
  },
  refreshToken: {
    secret: process.env.JWT_ACCESS_SECRET || "keepitrefreshkeepitsafe",
    expiresIn: "7d",
    expiresInMs: 604800000,
  },
};

export { jwtConfig, JWTConfig };

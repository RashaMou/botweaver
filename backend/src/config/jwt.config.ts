interface JWTConfig {
  accessToken: {
    secret: string;
    expiresIn: string | number;
  };
  refreshToken: {
    secret: string;
    expiresIn: string | number;
  };
}

const jwtConfig: JWTConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || "keepitsecretkeepitsafe",
    expiresIn: "15m",
  },
  refreshToken: {
    secret: process.env.JWT_ACCESS_SECRET || "keepitrefreshkeepitsafe",
    expiresIn: "7d",
  },
};

export { jwtConfig, JWTConfig };

import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  MONGODB_URI: string;
  TELEGRAM_WEBHOOK_URL: string;
  TELEGRAM_WEBHOOK_DEV_URL: string;
  TELEGRAM_BOT_TOKEN: string;
  JWT_SECRET: string;
  PORT: string;
}

const getEnvConfig = (): EnvConfig => {
  const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "TELEGRAM_BOT_TOKEN"];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    PORT: process.env.PORT!,
    NODE_ENV:
      (process.env.NODE_ENV as "development" | "production" | "test") ||
      "development",
    MONGODB_URI: process.env.MONGODB_URI!,
    TELEGRAM_WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL!,
    TELEGRAM_WEBHOOK_DEV_URL: process.env.TELEGRAM_WEBHOOK_DEV_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
  };
};

export const env = getEnvConfig();

import app from "./app";
import { env } from "./config/env.config";
import connectDB from "@/config/db.config";
import logger from "@/logger";
import telegramService from "@/services/telegram/telegram.service";

const port: number = parseInt(env.PORT || "8080", 10);

const startServer = async () => {
  if (!env.MONGODB_URI) {
    logger.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    await connectDB();
    telegramService.setWebhook();

    app.listen(port, () => {
      logger.info(`Server running on "http://localhost:${port}"`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Only start the server if we're not in test mode
if (env.NODE_ENV !== "test") {
  startServer();
}

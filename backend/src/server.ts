import app from "./app";
import connectDB from "@/config/db";
import logger from "@/logger";

const port: number = parseInt(process.env.PORT || "8080", 10);

const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    logger.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    await connectDB();
    app.listen(port, () => {
      logger.info(`Server running on "http://localhost:${port}"`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Only start the server if we're not in test mode
if (process.env.NODE_ENV !== "test") {
  startServer();
}

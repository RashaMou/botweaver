import mongoose from "mongoose";
import logger from "@/logger";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error(
      `MongoDB connection failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export default connectDB;

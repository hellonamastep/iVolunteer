import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const connectDB = async () => {
  let maxRetries = 5;
  let retryDelay = 5000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connect = await mongoose.connect(process.env.MONGODB_URI);
      logger.info(`🌐 MongoDB connected to ${connect.connection.host}`);

      // 🧹 Auto-fix for old indexes
      await autoFixIndexes();

      return;
    } catch (error) {
      logger.error(`MongoDB connection attempt ${attempt} failed!`, {
        error: error.message,
      });

      if (attempt === maxRetries) {
        logger.error("All MongoDB connection attempts failed, exiting...");
        throw error;
      }

      logger.info(`Retrying in ${retryDelay}ms... (${attempt}/${maxRetries})`);
      await sleep(retryDelay);
    }
  }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🧩 This runs once after DB connects
async function autoFixIndexes() {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();

    // find "otps" collection
    const otpCollection = collections.find((col) => col.name === "otps");
    if (otpCollection) {
      const indexes = await mongoose.connection.db.collection("otps").indexes();
      const userIdIndex = indexes.find((idx) => idx.name === "userId_1");

      if (userIdIndex) {
        logger.warn("🧹 Found old 'userId_1' index. Removing...");
        await mongoose.connection.db.collection("otps").dropIndex("userId_1");
        logger.info("✅ Removed invalid 'userId_1' index successfully!");
      } else {
        logger.info("✅ No invalid indexes found in 'otps' collection");
      }
    }
  } catch (err) {
    logger.error("⚠️ Error checking/removing invalid indexes:", err.message);
  }
}

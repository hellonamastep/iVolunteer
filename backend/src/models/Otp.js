// models/Otp.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ unique per user
    },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true }, // ✅ no index here
  },
  { timestamps: true }
);

// ✅ Only ONE TTL index — correct way
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model("Otp", otpSchema);

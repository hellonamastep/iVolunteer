// models/EventApplication.js
import mongoose from "mongoose";

const eventApplicationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: String,
    phone: String,
    message: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

eventApplicationSchema.index({ eventId: 1, userId: 1 }, { unique: true }); // Prevent duplicate registration

export const EventApplication = mongoose.model(
  "EventApplication",
  eventApplicationSchema
);

import mongoose from "mongoose";

const corporateInterestSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    corporateUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    respondedAt: {
      type: Date,
    },
    responseMessage: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Prevent duplicate interests from same corporate user for same event
corporateInterestSchema.index({ event: 1, corporateUser: 1 }, { unique: true });

export const CorporateInterest = mongoose.model("CorporateInterest", corporateInterestSchema);

import mongoose from "mongoose";

const donationEventSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      unique: true,
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    goalAmount: { type: Number, required: true, min: 0 },
    collectedAmount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "completed"], default: "active" },

    // 👇 NEW field for admin approval
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
      fundAccountId: { type: String }, // Razorpay fund account ID for the NGO

    // ----- New payment-related fields -----
    paymentMethods: [
      { type: String, enum: ["UPI", "Bank", "PayPal", "Razorpay"] },
    ],
    upiId: { type: String },
    bankAccount: {
      accountNumber: { type: String },
      ifsc: { type: String },
      accountHolder: { type: String },
    },
    razorpayOrderIds: [{ type: String }], // optional, store all Razorpay order IDs
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
donationEventSchema.index({ ngoId: 1 });
donationEventSchema.index({ status: 1 });

export const DonationEvent = mongoose.model(
  "DonationEvent",
  donationEventSchema
);

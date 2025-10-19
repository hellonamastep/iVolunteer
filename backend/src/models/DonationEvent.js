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
    // Basic Info
    title: { type: String, required: true, maxlength: 100 },
    category: { type: String, required: true },
    customCategory: { type: String }, // For "Other" category custom input
    goalAmount: { type: Number, required: true, min: 0 },
    endDate: { type: Date, required: true },
    coverImage: { type: String }, // Cloudinary URL
    shortDescription: { type: String, required: true, maxlength: 500 },
    
    // Story
    whyRaising: { type: String },
    whoBenefits: { type: String },
    howFundsUsed: { type: String },
    supportingMedia: [{ type: String }], // Array of Cloudinary URLs
    
    // Verification
    governmentId: { type: String }, // Cloudinary URL
    proofOfNeed: { type: String }, // Cloudinary URL
    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    
    // Settings
    displayRaisedAmount: { type: Boolean, default: true },
    allowAnonymous: { type: Boolean, default: false },
    enableComments: { type: Boolean, default: true },
    minimumDonation: { type: Number, default: 10 },
    socialShareMessage: { type: String },
    hashtags: { type: String },
    location: { type: String },
    
    // Legacy fields
    description: { type: String }, // For backward compatibility
    collectedAmount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "completed"], default: "active" },

    // Admin approval
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    fundAccountId: { type: String }, // Razorpay fund account ID for the NGO

    // Payment-related fields
    paymentMethods: [
      { type: String, enum: ["UPI", "Bank", "PayPal", "Razorpay"] },
    ],
    paymentMethod: { 
      type: String, 
      enum: ["manual", "auto"], 
      default: "manual" 
    }, // Manual approval or auto withdrawal
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

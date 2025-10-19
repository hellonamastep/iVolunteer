// models/Bid.js
import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "CorporateEvent", required: true },
  corporate: { type: mongoose.Schema.Types.ObjectId, ref: "Corporate", required: true },
  biddingOffer: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  additionalInfo: { type: String },
  status: { type: String, enum: ["pending", "selected", "rejected"], default: "pending" },
}, { timestamps: true });

export const Bid = mongoose.model("Bid", bidSchema);

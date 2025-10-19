import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  id: { type: String, default: () => new mongoose.Types.ObjectId().toString(), unique: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "DonationEvent", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 1 },
  date: { type: Date, default: Date.now },
  
});

donationSchema.index({ eventId: 1 });
donationSchema.index({ userId: 1 });

export const Donation = mongoose.model("Donation", donationSchema);

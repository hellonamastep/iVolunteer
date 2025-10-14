import { DonationEvent } from "../models/DonationEvent.js";
import { Donation } from "../models/Donation.js";
import { User } from "../models/User.js";
import crypto from "crypto";

import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// Verify Razorpay signature
export const verifySignature = (orderId, paymentId, signature) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
};

// Create donation and update user/event
export const donateToEventService = async (userId, eventId, amount) => {
  const event = await DonationEvent.findById(eventId);
  if (!event || event.status !== "active") {
    throw new Error("Event not found or not active");
  }

  const remaining = event.goalAmount - event.collectedAmount;
  if (remaining <= 0) {
    throw new Error("Donation goal already reached");
  }

  const finalAmount = Math.min(amount, remaining);

  const donation = await Donation.create({ userId, eventId, amount: finalAmount });

  event.collectedAmount += finalAmount;
  if (event.collectedAmount >= event.goalAmount) {
    event.status = "completed";
  }
  await event.save();

  const user = await User.findById(userId);
  const coinsEarned = Math.floor(finalAmount * 1.5);
  user.coins += coinsEarned;
  await user.save();

  // 3️⃣ Payout to NGO after donation is saved
  try {
    await payoutToNGO(eventId, finalAmount);
  } catch (err) {
    console.error("Payout to NGO failed:", err.message);
    // Optional: Notify admin or log for manual follow-up
  }

  return { donation, updatedEvent: event, coinsEarned };
};

export const payoutToNGO = async (eventId, amount) => {
  const event = await DonationEvent.findById(eventId);
  if (!event) throw new Error("Event not found");

  if (!event.upiId) throw new Error("NGO UPI/Bank details not provided");

  // 1️⃣ Create fund account for NGO (if not already created)
  let fundAccountId = event.fundAccountId;
  if (!fundAccountId) {
    const fundAccount = await razorpay.fundAccount.create({
      account_type: "vpa", // or "bank_account" if using bank
      vpa: { address: event.upiId },
      contact: {
        name: "NGO Name", // you can get from event or NGO collection
        email: "ngo@example.com",
        contact: "9876543210",
      },
    });
    fundAccountId = fundAccount.id;
    event.fundAccountId = fundAccountId;
    await event.save();
  }

  // 2️⃣ Transfer money via Payout
  const payout = await razorpay.payouts.create({
    fund_account_id: fundAccountId,
    amount: amount * 100, // in paise
    currency: "INR",
    mode: "UPI",
    purpose: "donation",
    queue_if_low_balance: true,
  });

  return payout;
};


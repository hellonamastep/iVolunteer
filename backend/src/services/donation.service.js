import { DonationEvent } from "../models/DonationEvent.js";
import { Donation } from "../models/Donation.js";
import { User } from "../models/User.js";
import crypto from "crypto";
import Razorpay from "razorpay";

// Initialize Razorpay with error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (error) {
  console.error("Razorpay initialization failed:", error);
}

// Verify Razorpay signature
export const verifySignature = (orderId, paymentId, signature) => {
  try {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === signature;
    console.log("Signature verification:", isValid);
    return isValid;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

// Create Razorpay order
export const createRazorpayOrder = async (amount, currency = "INR") => {
  try {
    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw new Error(`Payment gateway error: ${error.message}`);
  }
};

// Create donation and update user/event
export const donateToEventService = async (userId, eventId, amount) => {
  try {
    const event = await DonationEvent.findById(eventId);
    if (!event || event.status !== "active") {
      throw new Error("Event not found or not active");
    }

    const remaining = event.goalAmount - event.collectedAmount;
    if (remaining <= 0) {
      throw new Error("Donation goal already reached");
    }

    const finalAmount = Math.min(amount, remaining);

    const donation = await Donation.create({ 
      userId, 
      eventId, 
      amount: finalAmount 
    });

    event.collectedAmount += finalAmount;
    if (event.collectedAmount >= event.goalAmount) {
      event.status = "completed";
    }
    await event.save();

    const user = await User.findById(userId);
    const coinsEarned = Math.floor(finalAmount * 1.5);
    user.coins += coinsEarned;
    await user.save();

    // Payout to NGO (optional - you might want to handle this separately)
    try {
      await payoutToNGO(eventId, finalAmount);
    } catch (payoutError) {
      console.error("Payout to NGO failed:", payoutError.message);
      // Don't fail the donation if payout fails
    }

    return { donation, updatedEvent: event, coinsEarned };
  } catch (error) {
    console.error("Donation service error:", error);
    throw error;
  }
};

export const payoutToNGO = async (eventId, amount) => {
  try {
    const event = await DonationEvent.findById(eventId);
    if (!event) throw new Error("Event not found");

    if (!event.upiId) throw new Error("NGO UPI/Bank details not provided");

    let fundAccountId = event.fundAccountId;
    
    // Create fund account if not exists
    if (!fundAccountId) {
      const fundAccount = await razorpay.fundAccount.create({
        account_type: "vpa",
        vpa: { address: event.upiId },
        contact: {
          name: event.ngo?.name || "NGO Name",
          email: event.ngo?.email || "ngo@example.com",
          contact: "0000000000", // You should store this in your event/ngo model
        },
      });
      fundAccountId = fundAccount.id;
      event.fundAccountId = fundAccountId;
      await event.save();
    }

    // Create payout
    const payout = await razorpay.payouts.create({
      fund_account_id: fundAccountId,
      amount: amount * 100, // in paise
      currency: "INR",
      mode: "UPI",
      purpose: "donation",
      queue_if_low_balance: true,
    });

    console.log("Payout created:", payout.id);
    return payout;
  } catch (error) {
    console.error("Payout creation error:", error);
    throw error;
  }
};
import Razorpay from "razorpay";
import { donateToEventService } from "./donation.service.js";
import crypto from "crypto";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

 const createRazorpayOrder = async (eventId, amount) => {
  console.log("Creating order for event:", eventId, "amount:", amount);

  if (!eventId || !amount) throw new Error("Event ID and amount required");

  // Create receipt string and truncate to max 40 chars
  const receiptString = `donation_${eventId}_${Date.now()}`;
  const receipt = receiptString.slice(0, 40);

  const options = {
    amount: Math.round(amount * 100), // amount in paise
    currency: "INR",
    receipt,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    console.log("Razorpay order created:", order);
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      eventId,
    };
  } catch (err) {
    console.error("Razorpay error:", err); // log full error
    throw new Error(err?.error?.description || "Failed to create Razorpay order");
  }
};


const verifyRazorpayPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, userId, amount }) => {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new Error("Invalid payment signature");
  }

  const result = await donateToEventService(userId, eventId, amount);
  return result;
};

const paymentService = {
  createRazorpayOrder,
  verifyRazorpayPayment
};

export default paymentService;
import paymentService from "../services/payment.service.js";


// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { eventId, amount } = req.body;
    const order = await paymentService.createRazorpayOrder(eventId, Number(amount));
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Create order failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, userId, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification data" });
    }

    // ✅ Use the function from paymentService
    const result = await paymentService.verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      userId,
      amount,
    });

    res.status(200).json({ success: true, donation: result.donation, updatedEvent: result.updatedEvent });
  } catch (err) {
    console.error("Verify payment error:", err, { body: req.body });
    res.status(500).json({ success: false, message: err.message || "Payment verification failed" });
  }
};
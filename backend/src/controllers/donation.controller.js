import * as donationService from "../services/donation.service.js";

export const verifyAndDonate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, amount } = req.body;

    const isValid = donationService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Donation + automatic payout happens here
    const result = await donationService.donateToEventService(userId, eventId, amount);

    res.status(201).json({
      success: true,
      message: `Donation successful! You earned ${result.coinsEarned} coins 🎉`,
      ...result,
    });
  } catch (err) {
    console.error("Verify & Donate Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



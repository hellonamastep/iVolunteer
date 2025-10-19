import * as donationService from "../services/donation.service.js";

export const createOrder = async (req, res) => {
  try {
    const { eventId, amount } = req.body;
    
    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid amount" 
      });
    }

    const order = await donationService.createRazorpayOrder(amount);
    
    res.status(200).json({
      success: true,
      order: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        eventId
      }
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export const verifyAndDonate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, amount } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing payment details" 
      });
    }

    const isValid = donationService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: "Payment verification failed" 
      });
    }

    // Process donation
    const result = await donationService.donateToEventService(
      userId, 
      eventId, 
      amount
    );

    res.status(201).json({
      success: true,
      message: `Donation successful! You earned ${result.coinsEarned} coins 🎉`,
      donation: result.donation,
      coinsEarned: result.coinsEarned
    });
  } catch (err) {
    console.error("Verify & Donate Error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};
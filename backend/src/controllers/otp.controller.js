import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { otpService } from "../services/otp.service.js";

// Send OTP for registration
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const result = await otpService.sendOTP(email);

  return res.status(200).json(
    new ApiResponse(200, result, "OTP sent successfully")
  );
});

// Verify OTP for registration
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const result = await otpService.verifyOTP(email, otp);

  return res.status(200).json(
    new ApiResponse(200, result, "Email verified successfully")
  );
});

// Resend OTP
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const result = await otpService.resendOTP(email);

  return res.status(200).json(
    new ApiResponse(200, result, "OTP resent successfully")
  );
});

export const otpController = {
  sendOtp,
  verifyOtp,
  resendOtp
};
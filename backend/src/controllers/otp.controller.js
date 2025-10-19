import { asyncHandler } from "../utils/asyncHandler.js";
import { otpService } from "../services/otp.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createSession } from "../services/session.service.js";
import { setCookies } from "../utils/jwt.utils.js";

// Send OTP after successful credential validation
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await otpService.sendOtp(email);
  return res.status(200).json(new ApiResponse(200, result, "OTP sent successfully"));
});

// Verify OTP and login user
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const { user } = await otpService.verifyOtp(email, otp);

  const { accessToken, refreshToken } = await createSession(user);
  setCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    user,
    tokens: { accessToken, refreshToken },
    message: "OTP verified successfully — logged in!",
  });
});


export const otpController = { sendOtp, verifyOtp };

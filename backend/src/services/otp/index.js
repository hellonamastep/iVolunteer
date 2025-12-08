import * as resendRedis from "./providers/resendRedis.js";
import * as mongoSmtp from "./providers/mongoSmtp.js";

const provider = (process.env.OTP_PROVIDER || "resend-redis").toLowerCase();

const impl = provider === "mongo-smtp" ? mongoSmtp : resendRedis;
// Unified interface
export const otpService = {
  sendOtp: impl.sendOtp,
  verifyOtp: impl.verifyOtp,
};

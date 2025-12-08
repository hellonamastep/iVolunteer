import crypto from "crypto";

const OTP_SECRET = process.env.OTP_SECRET || "fallback";
export const OTP_CONF = {
  TTL: Number(process.env.OTP_TTL_SEC || 600),
  MAX_ATTEMPTS: Number(process.env.OTP_MAX_ATTEMPTS || 5),
  COOLDOWN: Number(process.env.OTP_COOLDOWN_SEC || 30),
};

export const genOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const hashOtp = (email, otp) =>
  crypto.createHmac("sha256", OTP_SECRET).update(`${email}:${otp}`).digest("hex");

export const safeEqual = (a, b) => {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};
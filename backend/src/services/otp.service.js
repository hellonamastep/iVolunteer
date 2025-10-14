import { Otp } from "../models/Otp.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import nodemailer from "nodemailer";

// Generate random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 min

  // Remove old OTP for this user (if any)
  await Otp.deleteMany({ userId: user._id });

  // Save new OTP
  await Otp.create({ userId: user._id, otp, expiresAt });

  // Send OTP email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your Login OTP Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });

  return { message: "OTP sent successfully" };
};

const verifyOtp = async (email, enteredOtp) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const record = await Otp.findOne({ userId: user._id });
  if (!record) throw new ApiError(400, "OTP not found");

  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ userId: user._id });
    throw new ApiError(400, "OTP expired");
  }

  if (record.otp !== enteredOtp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // OTP verified successfully → cleanup
  await Otp.deleteOne({ userId: user._id });
  return { message: "OTP verified successfully", user };
};

export const otpService = { sendOtp, verifyOtp };

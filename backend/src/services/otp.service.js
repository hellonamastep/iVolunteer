// services/otpService.js
import crypto from "crypto";
import { Otp } from "../models/Otp.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import nodemailer from "nodemailer";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const hash = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");

const sendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const otp = generateOtp();
  const otpHash = hash(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // one doc per userId; satisfies required otpHash
  await Otp.updateOne(
    { userId: user._id },
    { $set: { otpHash, expiresAt } },
    { upsert: true, runValidators: true }
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

await transporter.sendMail({
  from: `"MAILSTEP" <${process.env.SMTP_USER}>`,
  to: email,
  subject: "Your Secure Login Code – MAILSTEP",
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
      <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 6px 20px rgba(0,0,0,0.08);">
        <h2 style="text-align:center; color:#14b674; margin-bottom:8px;">MAILSTEP Secure Access</h2>
        <p style="text-align:center; color:#555; font-size:15px;">
          Your One-Time Login Code
        </p>
        <div style="margin-top: 30px; text-align:center;">
          <div style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color:#000;">
            ${otp}
          </div>
          <p style="margin-top: 16px; color:#666; font-size:14px;">
            This code expires in <strong>5 minutes</strong>.<br/>
            Do not share it with anyone.
          </p>
        </div>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
        <p style="text-align:center; font-size:12px; color:#888;">
          Powered securely by <strong>MAILSTEP</strong>.
        </p>
      </div>
    </div>
  `,
});


  return { message: "OTP sent successfully" };
};

const verifyOtp = async (email, enteredOtp) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const rec = await Otp.findOne({ userId: user._id });
  if (!rec) throw new ApiError(400, "OTP not found");

  if (rec.expiresAt <= new Date()) {
    await Otp.deleteOne({ userId: user._id });
    throw new ApiError(400, "OTP expired");
  }

  if (hash(enteredOtp) !== rec.otpHash) throw new ApiError(400, "Invalid OTP");

  await Otp.deleteOne({ userId: user._id }); // one-time use
  return { message: "OTP verified successfully", user };
};

export const otpService = { sendOtp, verifyOtp };

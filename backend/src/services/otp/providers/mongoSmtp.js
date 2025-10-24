import crypto from "crypto";
import nodemailer from "nodemailer";
import { User } from "../../../models/User.js";
import { Otp } from "../../../models/Otp.js";

const gen = () => String(Math.floor(100000 + Math.random() * 900000));
const sha = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendOtp(email) {
  const user = await User.findOne({ email });
  if (!user) return { ok: false, code: "not_found", message: "User not found" };

  const otp = gen();
  const otpHash = sha(otp);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.updateOne(
    { userId: user._id },
    { $set: { otpHash, expiresAt } },
    { upsert: true, runValidators: true }
  );

  await transporter.sendMail({
    from: `"MAILSTEP" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Secure Login Code – MAILSTEP",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
        <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 12px; padding: 24px;">
          <h2 style="text-align:center; color:#14b674;">MAILSTEP Secure Access</h2>
          <div style="margin-top: 30px; text-align:center; font-size:32px; letter-spacing:8px; font-weight:700;">
            ${otp}
          </div>
          <p style="text-align:center; color:#666;">Expires in 5 minutes.</p>
        </div>
      </div>
    `,
  });

  return { ok: true, message: "OTP sent" };
}

export async function verifyOtp(email, enteredOtp) {
  const user = await User.findOne({ email });
  if (!user) return { ok: false, code: "not_found", message: "User not found" };

  const rec = await Otp.findOne({ userId: user._id });
  if (!rec) return { ok: false, code: "missing", message: "OTP not found" };
  if (rec.expiresAt <= new Date()) {
    await Otp.deleteOne({ userId: user._id });
    return { ok: false, code: "expired", message: "OTP expired" };
  }
  if (sha(enteredOtp) !== rec.otpHash) return { ok: false, code: "invalid", message: "Invalid OTP" };

  await Otp.deleteOne({ userId: user._id });
  return { ok: true, message: "OTP verified" };
}

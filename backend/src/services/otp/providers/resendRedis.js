import { redis } from "../../../config/redis.js";
import { resend, FROM } from "../../../config/resend.js";
import { genOtp, hashOtp, safeEqual, OTP_CONF } from "../../../utils/otp.js";

const otpKey = (email) => `otp:${email.toLowerCase()}`;
const coolKey = (email) => `otp:cool:${email.toLowerCase()}`;

export async function sendOtp(emailRaw) {
  const email = emailRaw.toLowerCase();
  if (await redis.exists(coolKey(email)))
    return { ok: false, code: "cooldown" };

  const otp = genOtp();
  await redis
    .multi()
    .setex(
      otpKey(email),
      OTP_CONF.TTL,
      JSON.stringify({
        hash: hashOtp(email, otp),
        attempts: 0,
        createdAt: Date.now(),
      })
    )
    .setex(coolKey(email), OTP_CONF.COOLDOWN, "1")
    .exec();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM, // onboarding@resend.dev OR verified domain
      to: email,
      subject: "Verify Your Namastep Account",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.07)">
          
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px 12px 0 0">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px">namastep</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:40px">
              <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:24px;font-weight:600;line-height:1.3">Verify Your Email Address</h2>
              <p style="margin:0 0 32px;color:#666666;font-size:16px;line-height:1.6">
                Thanks for signing up with Namastep! Please use the verification code below to complete your registration.
              </p>
              
              <!-- OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding:24px;background-color:#f8f9fa;border-radius:8px;border:2px dashed #e0e0e0">
                    <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#667eea;font-family:'Courier New',Courier,monospace">${otp}</div>
                  </td>
                </tr>
              </table>
              
              <!-- Expiry Notice -->
              <p style="margin:24px 0 0;color:#999999;font-size:14px;text-align:center">
                ⏱️ This code expires in <strong style="color:#666666">${
                  OTP_CONF.TTL / 60
                } minutes</strong>
              </p>
              
              <!-- Security Notice -->
              <div style="margin-top:32px;padding:16px;background-color:#fff3cd;border-left:4px solid #ffc107;border-radius:4px">
                <p style="margin:0;color:#856404;font-size:14px;line-height:1.5">
                  <strong>🔒 Security tip:</strong> Never share this code with anyone. Namastep will never ask for your verification code.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;background-color:#f8f9fa;border-radius:0 0 12px 12px;text-align:center">
              <p style="margin:0 0 8px;color:#999999;font-size:14px">
                Didn't request this code? You can safely ignore this email.
              </p>
              <p style="margin:0;color:#999999;font-size:14px">
                © ${new Date().getFullYear()} Namastep. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Footer Links -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin-top:20px">
          <tr>
            <td align="center" style="padding:0 20px">
              <p style="margin:0;color:#999999;font-size:12px">
                <a href="#" style="color:#667eea;text-decoration:none;margin:0 8px">Help Center</a> |
                <a href="#" style="color:#667eea;text-decoration:none;margin:0 8px">Privacy Policy</a> |
                <a href="#" style="color:#667eea;text-decoration:none;margin:0 8px">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
`,
    });
    if (error) {
      await redis.del(otpKey(email), coolKey(email)); // rollback
      console.error("[Resend] send error:", error);
      return {
        ok: false,
        code: "send_failed",
        message: error.message || "Email send failed",
      };
    }
    console.log("[Resend] queued id:", data?.id);
    return { ok: true };
  } catch (e) {
    await redis.del(otpKey(email), coolKey(email));
    console.error("[Resend] send exception:", e.message);
    return { ok: false, code: "send_failed", message: "Email send exception" };
  }
}
export async function verifyOtp(emailRaw, otp) {
  const email = emailRaw.toLowerCase();
  const key = otpKey(email);

  const raw = await redis.get(key);
  if (!raw) return { ok: false, code: "expired", message: "Code expired" };

  const rec = JSON.parse(raw);
  if (rec.attempts >= OTP_CONF.MAX_ATTEMPTS)
    return { ok: false, code: "locked", message: "Too many attempts" };

  const match = safeEqual(rec.hash, hashOtp(email, otp));
  if (!match) {
    rec.attempts += 1;
    const ttl = await redis.ttl(key);
    await redis.setex(key, Math.max(ttl, 1), JSON.stringify(rec));
    return {
      ok: false,
      code: "invalid",
      attemptsLeft: OTP_CONF.MAX_ATTEMPTS - rec.attempts,
      message: "Invalid code",
    };
  }

  await redis.del(key);
  return { ok: true, message: "OTP verified" };
}

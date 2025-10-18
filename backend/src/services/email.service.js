
// import nodemailer from "nodemailer";

// const BRAND = {
//   name: "NAMASTEP",
//   color: "#4F46E5",
//   textDark: "#0F172A",
//   textLight: "#334155",
//   bg: "#F8FAFC",
//   border: "#E2E8F0",
// };

// const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@namastep.com";
// const FROM = process.env.EMAIL_FROM?.includes("<")
//   ? process.env.EMAIL_FROM
//   : `${BRAND.name} <${process.env.EMAIL_FROM || "no-reply@namastep.com"}>`;

// const PORT = parseInt(process.env.SMTP_PORT || "587", 10);

// export const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: PORT,
//   secure: PORT === 465,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// // ---------- HTML FRAME ----------

// function baseEmailTemplate(title, bodyHtml) {
//   const preheader = title || "";
//   return `
// <!doctype html>
// <html lang="en">
// <head>
//   <meta charset="utf-8">
//   <meta name="x-apple-disable-message-reformatting">
//   <meta name="viewport" content="width=device-width,initial-scale=1">
//   <title>${escapeHtml(title)}</title>
//   <style>
//     @media (max-width: 600px) {
//       .container { width: 100% !important; border-radius: 0 !important; }
//       .px { padding-left: 16px !important; padding-right: 16px !important; }
//     }
//     @media (prefers-color-scheme: dark) {
//       body, .wrap { background: #0B1220 !important; }
//       .container { background: #111827 !important; color: #E5E7EB !important; }
//       .muted { color: #9CA3AF !important; }
//       .btn { color: #FFFFFF !important; }
//     }
//   </style>
// </head>
// <body style="margin:0;padding:0;background:${BRAND.bg};">
//   <div style="display:none;opacity:0;visibility:hidden;height:0;width:0;overflow:hidden;">
//     ${escapeHtml(preheader)}
//   </div>

//   <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="wrap" style="background:${BRAND.bg};">
//     <tr>
//       <td align="center" style="padding:24px;">
//         <table role="presentation" width="600" class="container" cellspacing="0" cellpadding="0" border="0"
//                style="width:600px;max-width:600px;background:#FFFFFF;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
//           <tr>
//             <td class="px" style="padding:20px 24px;background:${BRAND.bg};border-bottom:1px solid ${BRAND.border};">
//               <div style="font:600 16px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;">
//                 <span style="display:inline-block;width:10px;height:10px;background:${BRAND.color};border-radius:999px;margin-right:8px;vertical-align:middle;"></span>
//                 <span style="vertical-align:middle;color:${BRAND.textDark};letter-spacing:0.2px">${BRAND.name}</span>
//               </div>
//             </td>
//           </tr>

//           <tr>
//             <td class="px" style="padding:24px 24px 0 24px;">
//               <h1 style="margin:0 0 8px 0;font:700 20px/1.3 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;color:${BRAND.textDark};">
//                 ${escapeHtml(title)}
//               </h1>
//             </td>
//           </tr>

//           <tr>
//             <td class="px" style="padding:8px 24px 24px 24px;font:400 14px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;color:${BRAND.textLight};">
//               ${bodyHtml}
//             </td>
//           </tr>

//           <tr>
//             <td class="px" style="padding:16px 24px 24px 24px;border-top:1px solid ${BRAND.border};font:400 12px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;color:#64748B;">
//               This email was sent by ${BRAND.name}. Need help?
//               <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.color};text-decoration:none;">${SUPPORT_EMAIL}</a>.
//               <div class="muted" style="margin-top:6px;color:#94A3B8;">
//                 &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
//               </div>
//             </td>
//           </tr>
//         </table>
//         <div style="height:24px;"></div>
//       </td>
//     </tr>
//   </table>
// </body>
// </html>
// `;
// }

// function buttonHtml(href, label) {
//   const safeHref = escapeHtml(href);
//   const safeLabel = escapeHtml(label);
//   return `
//   <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="left" style="margin:16px 0 8px 0;">
//     <tr>
//       <td class="btn" align="center" bgcolor="${BRAND.color}" style="border-radius:8px;">
//         <a href="${safeHref}" target="_blank"
//           style="display:inline-block;padding:12px 18px;font:600 14px/1 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;color:#FFFFFF;text-decoration:none;">
//           ${safeLabel}
//         </a>
//       </td>
//     </tr>
//   </table>`;
// }

// function textFallback(link) {
//   return [
//     "You requested a password reset for your NAMASTEP account.",
//     `Reset link: ${link}`,
//     "If you did not request this, ignore this email.",
//   ].join("\n\n");
// }

// function escapeHtml(s = "") {
//   return String(s)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");
// }

// // ---------- TEMPLATES ----------

// export async function sendPasswordResetEmail(to, resetLink) {
//   const title = "Reset your password";
//   const body = `
//     <p style="margin:0 0 12px 0;">You requested a password reset for your <strong>${BRAND.name}</strong> account.</p>
//     <p style="margin:0 0 16px 0;">This link expires in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
//     ${buttonHtml(resetLink, "Set new password")}
//     <p style="margin:16px 0 0 0;">If the button does not work, copy and paste this URL into your browser:</p>
//     <p style="word-break:break-all;margin:6px 0 0 0;"><a href="${escapeHtml(resetLink)}" style="color:${BRAND.color};text-decoration:none;">${escapeHtml(resetLink)}</a></p>
//   `;

//   const html = baseEmailTemplate(title, body);

//   await transporter.sendMail({
//     from: FROM,
//     to,
//     subject: `${BRAND.name}: Password Reset`,
//     html,
//     text: textFallback(resetLink),
//     headers: { "X-Entity-Ref-ID": `pwd-reset-${Date.now()}` },
//   });
// }

// export async function sendPasswResetSuccessEmail(to) {
//   const title = "Your password was changed";
//   const body = `
//     <p style="margin:0 0 12px 0;">Your <strong>${BRAND.name}</strong> account password was changed.</p>
//     <p style="margin:0 0 12px 0;">If this was you, no action is needed.</p>
//     <p style="margin:0;">If you did not perform this action, <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.color};text-decoration:none;">contact support</a> immediately.</p>
//   `;

//   const html = baseEmailTemplate(title, body);

//   await transporter.sendMail({
//     from: FROM,
//     to,
//     subject: `${BRAND.name}: Password Changed`,
//     html,
//     text: [
//       "Your password was changed.",
//       `If this wasn't you, contact support: ${SUPPORT_EMAIL}`,
//     ].join("\n\n"),
//     headers: { "X-Entity-Ref-ID": `pwd-changed-${Date.now()}` },
//   });
// }
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const BRAND = {
  name: "NAMASTEP",
  color: "#4F46E5",
  textDark: "#0F172A",
  textLight: "#334155",
  bg: "#F8FAFC",
  border: "#E2E8F0",
};

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@namastep.com";
const FROM = process.env.EMAIL_FROM || "no-reply@namastep.com";

// ---------- HTML FRAME ----------

function baseEmailTemplate(title, bodyHtml) {
  const preheader = title || "";
  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    @media (max-width: 600px) {
      .container { width: 100% !important; border-radius: 0 !important; }
      .px { padding-left: 16px !important; padding-right: 16px !important; }
    }
    @media (prefers-color-scheme: dark) {
      body, .wrap { background: #0B1220 !important; }
      .container { background: #111827 !important; color: #E5E7EB !important; }
      .muted { color: #9CA3AF !important; }
      .btn { color: #FFFFFF !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};">
  <div style="display:none;opacity:0;visibility:hidden;height:0;width:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="wrap" style="background:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:24px;">
        <table role="presentation" width="600" class="container" cellspacing="0" cellpadding="0" border="0"
               style="width:600px;max-width:600px;background:#FFFFFF;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
          <tr>
            <td class="px" style="padding:20px 24px;background:${BRAND.bg};border-bottom:1px solid ${BRAND.border};">
              <div style="font:600 16px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;">
                <span style="display:inline-block;width:10px;height:10px;background:${BRAND.color};border-radius:999px;margin-right:8px;vertical-align:middle;"></span>
                <span style="vertical-align:middle;color:${BRAND.textDark};letter-spacing:0.2px">${BRAND.name}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td class="px" style="padding:24px 24px 0 24px;">
              <h1 style="margin:0 0 8px 0;font:700 20px/1.3 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;color:${BRAND.textDark};">
                ${escapeHtml(title)}
              </h1>
            </td>
          </tr>

          <tr>
            <td class="px" style="padding:8px 24px 24px 24px;font:400 14px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;color:${BRAND.textLight};">
              ${bodyHtml}
            </td>
          </tr>

          <tr>
            <td class="px" style="padding:16px 24px 24px 24px;border-top:1px solid ${BRAND.border};font:400 12px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;color:#64748B;">
              This email was sent by ${BRAND.name}. Need help?
              <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.color};text-decoration:none;">${SUPPORT_EMAIL}</a>.
              <div class="muted" style="margin-top:6px;color:#94A3B8;">
                &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </div>
            </td>
          </tr>
        </table>
        <div style="height:24px;"></div>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function buttonHtml(href, label) {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="left" style="margin:16px 0 8px 0;">
    <tr>
      <td class="btn" align="center" bgcolor="${BRAND.color}" style="border-radius:8px;">
        <a href="${safeHref}" target="_blank"
          style="display:inline-block;padding:12px 18px;font:600 14px/1 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;color:#FFFFFF;text-decoration:none;">
          ${safeLabel}
        </a>
      </td>
    </tr>
  </table>`;
}

function textFallback(link) {
  return [
    "You requested a password reset for your NAMASTEP account.",
    `Reset link: ${link}`,
    "If you did not request this, ignore this email.",
  ].join("\n\n");
}

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- TEMPLATES ----------

export async function sendPasswordResetEmail(to, resetLink) {
  const title = "Reset your password";
  const body = `
    <p style="margin:0 0 12px 0;">You requested a password reset for your <strong>${BRAND.name}</strong> account.</p>
    <p style="margin:0 0 16px 0;">This link expires in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
    ${buttonHtml(resetLink, "Set new password")}
    <p style="margin:16px 0 0 0;">If the button does not work, copy and paste this URL into your browser:</p>
    <p style="word-break:break-all;margin:6px 0 0 0;"><a href="${escapeHtml(resetLink)}" style="color:${BRAND.color};text-decoration:none;">${escapeHtml(resetLink)}</a></p>
  `;

  const html = baseEmailTemplate(title, body);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `${BRAND.name}: Password Reset`,
      html,
      text: textFallback(resetLink),
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      throw new Error(`Email send failed: ${error.message}`);
    }

    console.log("✅ Password reset email sent successfully", { 
      messageId: data.id,
      to 
    });
    
    return data;
  } catch (err) {
    console.error("❌ Failed to send password reset email:", err.message);
    throw err;
  }
}

export async function sendPasswResetSuccessEmail(to) {
  const title = "Your password was changed";
  const body = `
    <p style="margin:0 0 12px 0;">Your <strong>${BRAND.name}</strong> account password was changed.</p>
    <p style="margin:0 0 12px 0;">If this was you, no action is needed.</p>
    <p style="margin:0;">If you did not perform this action, <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.color};text-decoration:none;">contact support</a> immediately.</p>
  `;

  const html = baseEmailTemplate(title, body);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `${BRAND.name}: Password Changed`,
      html,
      text: [
        "Your password was changed.",
        `If this wasn't you, contact support: ${SUPPORT_EMAIL}`,
      ].join("\n\n"),
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      throw new Error(`Email send failed: ${error.message}`);
    }

    console.log("✅ Password change confirmation sent", { 
      messageId: data.id,
      to 
    });
    
    return data;
  } catch (err) {
    console.error("❌ Failed to send password change email:", err.message);
    throw err;
  }
}

// Optional: Send OTP Email
export async function sendOTPEmail(to, otp) {
  const title = "Your OTP Code";
  const body = `
    <p style="margin:0 0 12px 0;">Your one-time password (OTP) for <strong>${BRAND.name}</strong> is:</p>
    <div style="background:${BRAND.bg};border:2px dashed ${BRAND.color};border-radius:8px;padding:20px;text-align:center;margin:16px 0;">
      <span style="font:700 32px/1 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;color:${BRAND.color};letter-spacing:8px;">
        ${escapeHtml(otp)}
      </span>
    </div>
    <p style="margin:16px 0 0 0;">This code will expire in <strong>10 minutes</strong>.</p>
    <p style="margin:8px 0 0 0;">If you didn't request this code, please ignore this email.</p>
  `;

  const html = baseEmailTemplate(title, body);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `${BRAND.name}: Your OTP Code`,
      html,
      text: `Your OTP code is: ${otp}\n\nThis code expires in 10 minutes.`,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      throw new Error(`Email send failed: ${error.message}`);
    }

    console.log("✅ OTP email sent successfully", { 
      messageId: data.id,
      to 
    });
    
    return data;
  } catch (err) {
    console.error("❌ Failed to send OTP email:", err.message);
    throw err;
  }
}

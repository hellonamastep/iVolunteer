// import nodemailer from "nodemailer";

// // Email transporter configuration
// // Supports both production Gmail and development testing
// let transporter;

// // Check if Gmail credentials are configured
// const hasGmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

// if (hasGmailConfig) {
//   // Production/Gmail configuration
//   console.log('📧 Using Gmail for email service');
//   transporter = nodemailer.createTransport({
//     service: "gmail",
//     pool: true,
//     maxConnections: 5,
//     maxMessages: 100,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
// } else {
//   // Development: Use Ethereal Email (test mode)
//   console.log('📧 Gmail not configured. Using Ethereal test email service');
//   console.log('ℹ️  To use Gmail, add EMAIL_USER and EMAIL_PASSWORD to .env');
//   console.log('ℹ️  See documentation/EMAIL_SETUP_GUIDE.md for setup instructions');
  
//   // Create test transporter (Ethereal will be set up when first email is sent)
//   transporter = null; // Will be initialized on first use
// }

// // Function to ensure transporter is ready (creates Ethereal account if needed)
// export const getTransporter = async () => {
//   if (transporter) {
//     return transporter;
//   }
  
//   // Create Ethereal test account
//   console.log('🔧 Creating Ethereal test email account...');
//   const testAccount = await nodemailer.createTestAccount();
  
//   console.log('✅ Ethereal Email Account Created:');
//   console.log('   Email:', testAccount.user);
//   console.log('   View emails at: https://ethereal.email/login');
//   console.log('   Username:', testAccount.user);
//   console.log('   Password:', testAccount.pass);
  
//   transporter = nodemailer.createTransport({
//     host: testAccount.smtp.host,
//     port: testAccount.smtp.port,
//     secure: testAccount.smtp.secure,
//     auth: {
//       user: testAccount.user,
//       pass: testAccount.pass,
//     },
//   });
  
//   return transporter;
// };

// // Export initial transporter (may be null for Ethereal)
// export { transporter };
// utils/email.js
import nodemailer from "nodemailer";
import { Resend } from "resend";

let transporter;
const isProduction = process.env.NODE_ENV === "production";

/**
 * Send email either through Gmail (local) or Resend (production)
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    // PRODUCTION → use RESEND API
    if (isProduction && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: "ElevateX <no-reply@resend.dev>",
        to,
        subject,
        html,
      });

      if (error) throw new Error(error.message);
      console.log("✅ [Resend] Email sent:", data.id);
      return true;
    }

    // DEVELOPMENT → use Gmail SMTP
    if (!transporter) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    const info = await transporter.sendMail({
      from: `"ElevateX" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ [Nodemailer] Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw error;
  }
};

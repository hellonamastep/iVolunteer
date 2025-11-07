import nodemailer from 'nodemailer';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { OTP } from '../models/Otp.js';

// Email transporter configuration
const createTransporter = () => {
  // Debug: Check if credentials exist
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not set in environment variables');
    console.error('EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ Missing');
    console.error('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Set' : '✗ Missing');
    throw new Error('Email credentials not configured');
  }

  console.log('✅ Email credentials found');
  console.log('📧 Using email:', process.env.EMAIL_USER);

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Add these for better debugging
    debug: true,
    logger: true
  });
};

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    console.log('📨 Attempting to send OTP email to:', email);
    
    const transporter = createTransporter();
    
    // Test connection first
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3ABBA5;">Email Verification</h2>
          <p>Thank you for registering with Namastep. Please use the following OTP code to verify your email address:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #3ABBA5; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully');
    console.log('📬 Message ID:', info.messageId);
    
    logger.info('OTP email sent successfully', { email, messageId: info.messageId });
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', {
      email,
      errorMessage: error.message,
      errorCode: error.code,
      errorCommand: error.command,
      errorStack: error.stack
    });
    
    logger.error('Error sending OTP email', { 
      email, 
      error: error.message,
      code: error.code,
      command: error.command
    });
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new ApiError(500, 'Email authentication failed. Please check email credentials.');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      throw new ApiError(500, 'Email server connection failed. Please try again later.');
    } else {
      throw new ApiError(500, `Failed to send OTP email: ${error.message}`);
    }
  }
};
// Store OTP in database
// const storeOTP = async (email, otp) => {
//   try {
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
//     // Delete any existing OTP for this email
//     await OTP.deleteMany({ email: email.toLowerCase().trim() });
    
//     // Store new OTP with isVerified flag
//     await OTP.create({
//       email: email.toLowerCase().trim(),
//       otp,
//       expiresAt,
//       isVerified: false // Add verification flag
//     });
    
//     return true;
//   } catch (error) {
//     logger.error('Error storing OTP', { email, error: error.message });
//     throw new ApiError(500, 'Failed to store OTP');
//   }
// };
const storeOTP = async (email, otp) => {
  try {
    console.log('💾 Attempting to store OTP...');
    console.log('📧 Email:', email);
    console.log('🔢 OTP:', otp);
    
    // Check if MongoDB is connected
    const mongoose = await import('mongoose');
    console.log('🔌 MongoDB connection state:', mongoose.connection.readyState);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB is not connected! State:', mongoose.connection.readyState);
      throw new Error('Database connection is not ready');
    }
    
    console.log('✅ MongoDB is connected');
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log('⏰ OTP will expire at:', expiresAt);
    
    // Delete any existing OTP for this email
    console.log('🗑️  Deleting old OTPs for this email...');
    const deleteResult = await OTP.deleteMany({ email: email.toLowerCase().trim() });
    console.log('🗑️  Deleted', deleteResult.deletedCount, 'old OTP(s)');
    
    // Store new OTP with isVerified flag
    console.log('💾 Creating new OTP record...');
    const otpData = {
      email: email.toLowerCase().trim(),
      otp,
      expiresAt,
      isVerified: false
    };
    console.log('📋 OTP data to save:', {
      email: otpData.email,
      otp: otpData.otp,
      expiresAt: otpData.expiresAt,
      isVerified: otpData.isVerified
    });
    
    const savedOTP = await OTP.create(otpData);
    console.log('✅ OTP saved successfully!');
    console.log('📝 Saved OTP ID:', savedOTP._id);
    
    return true;
  } catch (error) {
    console.error('❌ ERROR in storeOTP:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      console.error('🔴 This is a MongoDB error!');
      console.error('MongoDB error details:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
    }
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      console.error('🔴 MongoDB Validation Error!');
      console.error('Validation errors:', error.errors);
    }
    
    logger.error('Error storing OTP', { 
      email, 
      error: error.message,
      errorName: error.name,
      errorCode: error.code,
      stack: error.stack
    });
    
    throw new ApiError(500, `Failed to store OTP: ${error.message}`);
  }
};

// Send OTP
export const sendOTP = async (email) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(400, 'An account with this email already exists');
    }

    const otp = generateOTP();
    
    // Store OTP
    await storeOTP(normalizedEmail, otp);
    
    // Send email
    await sendOTPEmail(normalizedEmail, otp);
    
    return { 
      success: true, 
      message: 'OTP sent successfully',
      // Don't send OTP back in production, this is for testing only
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('Error in sendOTP service', { email, error: error.message });
    throw new ApiError(500, 'Failed to send OTP');
  }
};

// Verify OTP - MARKS AS VERIFIED, doesn't delete
// In otp.service.js - update the verifyOTP function
export const verifyOTP = async (email, otp) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    console.log("🔐 OTP Verification Attempt:", { email: normalizedEmail, otp });
    
    // Find the OTP record
    const otpRecord = await OTP.findOne({ 
      email: normalizedEmail,
      otp 
    });

    console.log("📋 OTP Record Found:", otpRecord);

    if (!otpRecord) {
      console.log("❌ No OTP record found for email:", normalizedEmail);
      throw new ApiError(400, 'Invalid OTP');
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      console.log("❌ OTP expired:", otpRecord.expiresAt);
      await OTP.deleteOne({ _id: otpRecord._id });
      throw new ApiError(400, 'OTP has expired');
    }

    // Check if already verified
    if (otpRecord.isVerified) {
      console.log("✅ OTP already verified");
      return { 
        success: true, 
        message: 'Email already verified' 
      };
    }

    // Mark as verified
    otpRecord.isVerified = true;
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();
    console.log("✅ OTP verified and marked as verified");

    return { 
      success: true, 
      message: 'Email verified successfully' 
    };
  } catch (error) {
    console.error("💥 OTP verification error:", error.message);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to verify OTP');
  }
};

// Add this function to check if OTP is verified
export const isOTPVerified = async (email, otp) => {
  const normalizedEmail = email.toLowerCase().trim();
  const otpRecord = await OTP.findOne({ 
    email: normalizedEmail,
    otp,
    isVerified: true
  });
  
  return !!otpRecord;
};

// Check if OTP is verified (for registration)
// In otp.service.js
const checkOTPVerified = async (email, otp) => {
  const normalizedEmail = email.toLowerCase().trim();
  const otpRecord = await OTP.findOne({ 
    email: normalizedEmail, 
    otp: otp.toString() // Ensure string comparison
  });
  
  if (!otpRecord) {
    throw new Error('OTP not found');
  }
  
  if (otpRecord.expiresAt < new Date()) {
    throw new Error('OTP has expired');
  }
  
  if (!otpRecord.isVerified) {
    throw new Error('OTP not verified');
  }
  
  return true;
};

// Resend OTP
export const resendOTP = async (email) => {
  try {
    return await sendOTP(email);
  } catch (error) {
    logger.error('Error in resendOTP service', { email, error: error.message });
    throw error;
  }
};

export const otpService = {
  sendOTP,
  verifyOTP,
  resendOTP,
  checkOTPVerified // Export the new function
};
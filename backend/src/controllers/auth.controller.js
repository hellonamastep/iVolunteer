


import { authService } from "../services/auth.service.js";
import { createSession } from "../services/session.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { setCookies, clearCookies } from "../utils/jwt.utils.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cloudinary } from "../config/cloudinary.js";
import { otpService } from "../services/otp.service.js";

// new
import { sendPasswordResetEmail, sendPasswResetSuccessEmail } from "../services/email.service.js";

const register = asyncHandler(async (req, res) => {
  console.log("Registration request received:", req.body);
  const user = await authService.register(req.body);
  console.log("User created with coins:", user.coins);

  let tokens;
  try {
    tokens = await createSession(user);
  } catch (err) {
    console.error("Session creation failed:", err);
    throw new ApiError(500, "Error while creating session");
  }

  setCookies(res, tokens.accessToken, tokens.refreshToken);

  const userResponse = {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    coins: user.coins,
  };

  console.log("Registration response:", userResponse);

  return res.status(201).json({
    user: userResponse,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
    message:
      "User registered successfully! You've been awarded 50 coins as a welcome bonus!",
  });
});


const googleLogin = asyncHandler(async (req, res) => {
  const { email, name, profilePicture } = req.body;

  if (!email || !name) {
    throw new ApiError(400, "Email and name are required");
  }

  const { user, tokens } = await authService.googleLogin({
    email,
    name,
    profilePicture,
  });

  // Set tokens in HttpOnly cookies
  setCookies(res, tokens.accessToken, tokens.refreshToken);

  const userResponse = {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    coins: user.coins,
    profilePicture: user.profilePicture,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, { user: userResponse, tokens }, "Login successful via Google"));
});


const login = asyncHandler(async (req, res) => {
  // Step 1: Validate credentials
  const user = await authService.login(req.body);

  // Step 2: Create session tokens
  const { accessToken, refreshToken } = await createSession(user);

  // Step 3: Set cookies for frontend
  setCookies(res, accessToken, refreshToken);

  // Step 4: Return user info + tokens
  return res.status(200).json({
    user: {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      coins: user.coins,
      profilePicture: user.profilePicture,
    },
    tokens: { accessToken, refreshToken },
    message: "Login successful!",
  });
});

// Step 2: verify OTP then mint session
export const verifyLoginOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body || {};
  if (!email || !otp) throw new ApiError(400, "Email and OTP required");

  const user = await otpService.verifyOtp(email, otp);

  const { accessToken, refreshToken } = await createSession(user);
  setCookies(res, accessToken, refreshToken);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          userId: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          coins: user.coins,
          profilePicture: user.profilePicture,
        },
        tokens: { accessToken, refreshToken },
      },
      "Login successful"
    )
  );
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  await authService.logout(refreshToken);
  clearCookies(res);

  return res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
});

const getUser = asyncHandler(async (req, res) => {
  const id = req.user?._id;
  const user = await authService.getUser(id);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User account fetched successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const id = req.user?._id;

  const result = await authService.changePassword(id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, { result }, "Password changed successfully"));
});

const forgetPasswordRequest = asyncHandler(async (req, res) => {
  const email = (req.body?.email || "").toLowerCase().trim();
  if (!email) {
    return res.status(400).json(new ApiResponse(400, {}, "Email is required"));
  }

  const result = await authService.forgetPasswordRequest({ email });

  if (result && result.token) {
    const resetLink = `https://namastep.vercel.app/forgot-password/${result.token}`;
    try {
      await sendPasswordResetEmail(result.email, resetLink);
      console.log("Password reset email dispatched", { userId: result.userId });
    } catch (err) {
      console.error("Failed to send password reset email", {
        userId: result.userId,
        err: err.message,
      });
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "If an account exists for that email, a password reset email was sent"
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params.token;
  const password = req.body?.password;
  const passwordConfirm = req.body?.passwordConfirm;

  if (!token) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Reset token is required"));
  }
  if (!password) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Password is required"));
  }
  if (passwordConfirm !== undefined && password !== passwordConfirm) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Passwords do not match"));
  }

  const user = await authService.resetPassword(token, password);

  try {
    await sendPasswResetSuccessEmail(user.email);
    console.log("Password reset success email sent", { userId: user.userId });
  } catch (err) {
    console.error("Failed sending password reset success email", {
      userId: user.userId,
      err: err.message,
    });
  }

  console.log("Password reset successful", { userId: user.userId });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successful"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const id = req.user?._id;
  const updateData = { ...req.body };

  delete updateData.password;
  delete updateData.role;
  delete updateData.email;
  delete updateData.points;
  delete updateData.coins;
  delete updateData.completedEvents;

  const updatedUser = await authService.updateProfile(id, updateData);

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: updatedUser }, "Profile updated successfully")
    );
});

const uploadProfilePicture = asyncHandler(async (req, res) => {
  const id = req.user?._id;

  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "iVolunteer_profiles",
      transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
      public_id: `profile_${id}_${Date.now()}`,
    });

    const user = await authService.getUser(id);
    if (user.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(user.cloudinaryPublicId);
    }

    const updatedUser = await authService.updateProfile(id, {
      profilePicture: result.secure_url,
      cloudinaryPublicId: result.public_id,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: updatedUser },
          "Profile picture uploaded successfully"
        )
      );
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw new ApiError(500, "Failed to upload profile picture");
  }
});

const removeProfilePicture = asyncHandler(async (req, res) => {
  const id = req.user?._id;

  try {
    const user = await authService.getUser(id);

    if (!user.cloudinaryPublicId) {
      throw new ApiError(400, "No profile picture to remove");
    }

    await cloudinary.uploader.destroy(user.cloudinaryPublicId);

    const updatedUser = await authService.updateProfile(id, {
      profilePicture: null,
      cloudinaryPublicId: null,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: updatedUser },
          "Profile picture removed successfully"
        )
      );
  } catch (error) {
    console.error("Error removing profile picture:", error);
    throw new ApiError(500, "Failed to remove profile picture");
  }
});

const deleteAccount = asyncHandler(async (req, res) => {
  const id = req.user?._id;
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required to delete account");
  }

  await authService.deleteAccount(id, password);
  clearCookies(res);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Account deleted successfully"));
});

export const authController = {
  register,
  login,
  verifyLoginOtp,
  logout,
  getUser,
  changePassword,
  forgetPasswordRequest,
  resetPassword,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  deleteAccount,
  googleLogin
};
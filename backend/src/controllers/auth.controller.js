import { authService } from "../services/auth.service.js";
import { createSession } from "../services/session.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { setCookies, clearCookies } from "../utils/jwt.utils.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cloudinary } from "../config/cloudinary.js";
import { otpService } from "../services/otp.service.js";

const register = asyncHandler(async(req, res) => {
    console.log("Registration request received:", req.body);
    const user = await authService.register(req.body);
    console.log("User created with coins:", user.coins);

    // Wrap session creation in try/catch to catch errors
    let tokens;
    try {
        tokens = await createSession(user);
    } catch(err) {
        console.error("Session creation failed:", err);
        throw new ApiError(500, "Error while creating session");
    }

    setCookies(res, tokens.accessToken, tokens.refreshToken);

    // Return user info including coins
    const userResponse = {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        coins: user.coins
    };

    console.log("Registration response:", userResponse);

    return res.status(201).json({
        user: userResponse, 
        tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        },
        message: "User registered successfully! You've been awarded 50 coins as a welcome bonus!"
    });
});

const login = asyncHandler(async (req, res) => {
  // Step 1: Verify user credentials
  const user = await authService.login(req.body);

  // Step 2: Send OTP email
  await otpService.sendOtp(user.email);

  // Step 3: Return success message without tokens
  return res.status(200).json({
    user: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
    message: "OTP sent to your email. Please verify to complete login.",
  });
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
  const user = await authService.forgetPasswordRequest(req.body);
  const resetLink = `${process.env.CLIENT_URL}/forget-password/${user.token}`;

  await sendPasswordResetEmail(user.email, resetLink);

  logger.info("Password reset link generated from this Id: ", {
    userId: user.userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset email send successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params.token;

  const user = await authService.resetPassword(token, req.body);
  await sendPasswResetSuccessEmail(user.email);

  logger.info("Password reset successful from this Id: ", {
    userId: user.userId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfull"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const id = req.user?._id;
  const updateData = req.body;

  // Remove sensitive fields that shouldn't be updated via this endpoint
  delete updateData.password;
  delete updateData.role;
  delete updateData.email; // Email shouldn't be changed here
  delete updateData.points;
  delete updateData.coins;
  delete updateData.completedEvents;

  const updatedUser = await authService.updateProfile(id, updateData);

  return res
    .status(200)
    .json(new ApiResponse(200, { user: updatedUser }, "Profile updated successfully"));
});

const uploadProfilePicture = asyncHandler(async (req, res) => {
  const id = req.user?._id;

  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'iVolunteer_profiles',
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" }
      ],
      public_id: `profile_${id}_${Date.now()}`
    });

    // Delete old profile picture if exists
    const user = await authService.getUser(id);
    if (user.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(user.cloudinaryPublicId);
    }

    // Update user with new profile picture
    const updatedUser = await authService.updateProfile(id, {
      profilePicture: result.secure_url,
      cloudinaryPublicId: result.public_id
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { user: updatedUser }, "Profile picture uploaded successfully"));
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw new ApiError(500, "Failed to upload profile picture");
  }
});

const removeProfilePicture = asyncHandler(async (req, res) => {
  const id = req.user?._id;

  try {
    // Get user to check if they have a profile picture
    const user = await authService.getUser(id);
    
    if (!user.cloudinaryPublicId) {
      throw new ApiError(400, "No profile picture to remove");
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(user.cloudinaryPublicId);

    // Update user - remove profile picture
    const updatedUser = await authService.updateProfile(id, {
      profilePicture: null,
      cloudinaryPublicId: null
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { user: updatedUser }, "Profile picture removed successfully"));
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
  logout,
  getUser,
  changePassword,
  forgetPasswordRequest,
  resetPassword,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  deleteAccount,
};

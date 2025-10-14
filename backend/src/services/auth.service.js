import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { Session } from "../models/Session.js";
import { RegistrationReward } from "../models/RegistrationReward.js";
import {
  hashPassword,
  comparePassword,
  hashToken,
  generateToken,
} from "../utils/password.utils.js";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { cloudinary } from "../config/cloudinary.js";
import Post from "../models/Post.js";
import { Event } from "../models/Event.js";
import { EventApplication } from "../models/EventApplication.js";
import { Community } from "../models/Community.js";
import Group from "../models/Group.js";
import { Donation } from "../models/Donation.js";
import { DonationEvent } from "../models/DonationEvent.js";

const register = async (data) => {
  const email = data.email.toLowerCase().trim();
  const userExist = await User.findOne({ email });

  if (userExist) {
    throw new ApiError(400, "An account with this email already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  // Create the user with initial 50 coins and additional fields for NGOs/Corporates
  const userData = {
    email,
    name: data.name,
    password: hashedPassword,
    role: data.role,
    coins: 50, // Give 50 coins for registration
  };

  // Add Volunteer-specific fields if role is 'user'
  if (data.role === "user") {
    userData.age = data.age;
    userData.city = data.city;
    userData.profession = data.profession;
  }

  // Add NGO-specific fields if role is 'ngo'
  if (data.role === "ngo") {
    userData.organizationType = data.organizationType;
    userData.websiteUrl = data.websiteUrl;
    userData.yearEstablished = data.yearEstablished;
    userData.contactNumber = data.contactNumber;
    userData.address = {
      street: data.address?.street,
      city: data.address?.city,
      state: data.address?.state,
      zip: data.address?.zip,
      country: data.address?.country || "India",
    };
    userData.ngoDescription = data.ngoDescription;
    userData.focusAreas = data.focusAreas || [];
    userData.organizationSize = data.organizationSize;
  }

  // Add Corporate-specific fields if role is 'corporate'
  if (data.role === "corporate") {
    userData.companyType = data.companyType;
    userData.industrySector = data.industrySector;
    userData.companySize = data.companySize;
    userData.websiteUrl = data.websiteUrl;
    userData.yearEstablished = data.yearEstablished;
    userData.contactNumber = data.contactNumber;
    userData.address = {
      street: data.address?.street,
      city: data.address?.city,
      state: data.address?.state,
      zip: data.address?.zip,
      country: data.address?.country || "India",
    };
    userData.companyDescription = data.companyDescription;
    userData.csrFocusAreas = data.csrFocusAreas || [];
  }

  // Save user
  const user = await User.create(userData);

  // Save registration reward separately
  await RegistrationReward.create({
    userId: user._id,
    coins: 50,
    type: "registration_bonus",
  });

  logger.info("New user registered with welcome bonus", {
    userId: user._id,
    email: user.email,
    coins: 50,
  });

  return user;
};


const login = async (data) => {
  const email = data.email.toLowerCase().trim();

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isValidPass = await comparePassword(data.password, user.password);

  if (!isValidPass) {
    throw new ApiError(401, "Invalid password");
  }

  return {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    coins: user.coins,
    profilePicture: user.profilePicture,
    cloudinaryPublicId: user.cloudinaryPublicId,
  };
};

const logout = async (refreshToken) => {
  const hashedToken = hashToken(refreshToken);
  const session = await Session.findOneAndDelete({ refreshToken: hashedToken });

  if (!session) throw new ApiError(403, "Unauthorized request");

  return { message: "Session invalidated successfully" };
};

const getUser = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  return user;
};

const changePassword = async (id, data) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await comparePassword(
    data.oldPassword,
    user.password
  );
  if (!isPasswordValid) throw new ApiError(401, "Password is incorrect");

  if (data.newPassword !== data.confirmPassword) {
    throw new ApiError(401, "Password does not match with confirm password");
  }

  const newPassword = await hashPassword(data.newPassword);

  user.password = newPassword;

  await user.save();

  return { message: "Password changed successfully" };
};

const forgetPasswordRequest = async (data) => {
  const email = data.email.toLowerCase().trim();
  const user = await User.findOne({ email });

  if (!user) throw new ApiError(404, "User with this email does not exist");

  const rawToken = generateToken();
  const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const hashedToken = hashToken(rawToken);

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiresAt = resetTokenExpiresAt;

  await user.save();

  return { email: user.email, token: rawToken, userId: user._id };
};

const resetPassword = async (token, password) => {
  const hashedToken = hashToken(token);
  const user = await User.findOne({ resetPasswordToken: hashedToken });

  if (!user || user.resetPasswordExpiresAt.getTime() < Date.now()) {
    throw new ApiError(403, "Invalid or Expired reset token");
  }

  const newPassword = await hashPassword(password);
  user.password = newPassword;

  await user.save();

  return { email: user.email, userId: user._id };
};

const updateProfile = async (id, updateData) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  // Update allowed fields based on role
  const allowedFields = ['name', 'profilePicture', 'cloudinaryPublicId'];
  
  if (user.role === 'user') {
    allowedFields.push('age', 'city', 'profession');
  } else if (user.role === 'ngo') {
    allowedFields.push('organizationType', 'websiteUrl', 'yearEstablished', 'contactNumber', 'ngoDescription', 'focusAreas', 'organizationSize');
  } else if (user.role === 'corporate') {
    allowedFields.push('companyType', 'industrySector', 'companySize', 'websiteUrl', 'yearEstablished', 'contactNumber', 'companyDescription', 'csrFocusAreas');
  }

  // Update only allowed fields
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });

  // Handle address update for NGO and Corporate
  if ((user.role === 'ngo' || user.role === 'corporate') && updateData.address) {
    user.address = {
      ...user.address,
      ...updateData.address
    };
  }

  await user.save();

  // Return user without password
  const updatedUser = await User.findById(id).select("-password");
  return updatedUser;
};

const deleteAccount = async (id, password) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  // Verify password before deleting
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new ApiError(401, "Incorrect password");

  logger.info("Starting comprehensive account deletion", { userId: id, email: user.email });

  try {
    // 1. Delete all user sessions
    await Session.deleteMany({ userId: id });
    logger.info("Deleted user sessions", { userId: id });

    // 2. Delete user's registration rewards
    await RegistrationReward.deleteMany({ userId: id });
    logger.info("Deleted registration rewards", { userId: id });

    // 3. Delete all posts created by the user
    const userPosts = await Post.find({ user: id });
    for (const post of userPosts) {
      // Delete post images from Cloudinary
      if (post.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(post.cloudinaryPublicId);
        } catch (error) {
          logger.error("Error deleting post image from Cloudinary", {
            userId: id,
            postId: post._id,
            error: error.message,
          });
        }
      }
    }
    await Post.deleteMany({ user: id });
    logger.info("Deleted user posts", { userId: id, count: userPosts.length });

    // 4. Remove user's comments from all posts
    await Post.updateMany(
      { "comments.user": id },
      { $pull: { comments: { user: id } } }
    );
    logger.info("Removed user comments from posts", { userId: id });

    // 5. Remove user's reactions from all posts
    await Post.updateMany(
      { "reactions.user": id },
      { $pull: { reactions: { user: id } } }
    );
    logger.info("Removed user reactions from posts", { userId: id });

    // 6. Delete all events created by the user
    await Event.deleteMany({ organizationId: id });
    logger.info("Deleted events created by user", { userId: id });

    // 7. Delete all event applications by the user
    await EventApplication.deleteMany({ userId: id });
    logger.info("Deleted user event applications", { userId: id });

    // 8. Remove user from event participants
    await Event.updateMany(
      { participants: id },
      { $pull: { participants: id } }
    );
    logger.info("Removed user from event participants", { userId: id });

    // 9. Delete all groups created by the user
    const userGroups = await Group.find({ creator: id });
    for (const group of userGroups) {
      // Delete group chat images from Cloudinary
      for (const message of group.messages) {
        if (message.cloudinaryPublicId) {
          try {
            await cloudinary.uploader.destroy(message.cloudinaryPublicId);
          } catch (error) {
            logger.error("Error deleting group message image from Cloudinary", {
              userId: id,
              groupId: group._id,
              error: error.message,
            });
          }
        }
      }
    }
    await Group.deleteMany({ creator: id });
    logger.info("Deleted groups created by user", { userId: id, count: userGroups.length });

    // 10. Remove user from group members
    await Group.updateMany(
      { "members.user": id },
      { $pull: { members: { user: id } } }
    );
    logger.info("Removed user from group memberships", { userId: id });

    // 11. Delete messages sent by user in all groups
    await Group.updateMany(
      { "messages.sender": id },
      { $pull: { messages: { sender: id } } }
    );
    logger.info("Deleted user messages from groups", { userId: id });

    // 12. Handle communities owned by the user
    const userCommunities = await Community.find({ owner: id });
    await Community.deleteMany({ owner: id });
    logger.info("Deleted communities owned by user", { userId: id, count: userCommunities.length });

    // 13. Remove user from community members
    await Community.updateMany(
      { "members.user": id },
      { $pull: { members: { user: id } } }
    );
    logger.info("Removed user from community memberships", { userId: id });

    // 14. Delete donations made by the user
    await Donation.deleteMany({ userId: id });
    logger.info("Deleted user donations", { userId: id });

    // 15. Delete donation events created by the user
    await DonationEvent.deleteMany({ createdBy: id });
    logger.info("Deleted donation events created by user", { userId: id });

    // 16. Delete user's profile picture from Cloudinary if exists
    if (user.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(user.cloudinaryPublicId);
        logger.info("Deleted profile picture from Cloudinary", { userId: id });
      } catch (error) {
        logger.error("Error deleting profile picture from Cloudinary", {
          userId: id,
          error: error.message,
        });
      }
    }

    // 17. Finally, delete the user account
    await User.findByIdAndDelete(id);

    logger.info("✅ Account and all associated data deleted successfully", { 
      userId: id, 
      email: user.email 
    });

    return { message: "Account deleted successfully" };
  } catch (error) {
    logger.error("Error during account deletion", {
      userId: id,
      error: error.message,
      stack: error.stack,
    });
    throw new ApiError(500, "Error deleting account and associated data");
  }
};

export const authService = {
  register,
  login,
  logout,
  getUser,
  changePassword,
  forgetPasswordRequest,
  resetPassword,
  updateProfile,
  deleteAccount,
};

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: [
        // Admin notifications
        "event_approval_request",
        "event_completion_request",
        "donation_event_request",
        "blog_approval_request",
        "corporate_event_request",
        
        // NGO notifications
        "event_approved",
        "event_rejected",
        "event_completion_approved",
        "event_completion_rejected",
        "participation_request",
        "volunteer_joined",
        "volunteer_left",
        
        // Volunteer notifications
        "participation_accepted",
        "participation_rejected",
        "event_started",
        "event_completed",
        "points_awarded",
        "certificate_awarded",
        "badge_earned",
        "event_cancelled",
        "event_updated",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    actionUrl: {
      type: String,
    },
    metadata: {
      eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
      requestId: { type: mongoose.Schema.Types.ObjectId },
      points: { type: Number },
      badgeName: { type: String },
      certificateUrl: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
  try {
    const notification = await this.create(data);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function (notificationIds, userId) {
  try {
    await this.updateMany(
      { _id: { $in: notificationIds }, recipient: userId },
      { $set: { read: true } }
    );
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
  try {
    const count = await this.countDocuments({ recipient: userId, read: false });
    return count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

export const Notification = mongoose.model("Notification", notificationSchema);

import { Notification } from "../models/Notification.js";

// Create a notification
export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get notifications for the authenticated user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, skip = 0, unreadOnly = false } = req.query;

    const query = { recipient: userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("sender", "name profilePicture role")
      .populate("metadata.eventId", "title organization date location");

    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      total: await Notification.countDocuments(query),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.getUnreadCount(userId);
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notifications as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: "notificationIds must be an array",
      });
    }

    await Notification.markAsRead(notificationIds, userId);

    res.status(200).json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete all read notifications
export const deleteAllRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ recipient: userId, read: true });

    res.status(200).json({ success: true, message: "All read notifications deleted" });
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Notification service helper functions
export const notificationService = {
  // Admin notifications
  async notifyAdminEventApproval(eventId, eventTitle, ngoName, ngoId) {
    try {
      const admins = await require("../models/User.js").User.find({ role: "admin" });
      
      const notifications = admins.map((admin) => ({
        recipient: admin._id,
        sender: ngoId,
        type: "event_approval_request",
        title: "New Event Approval Request",
        message: `${ngoName} has submitted "${eventTitle}" for approval`,
        actionUrl: `/admin/pendingrequest`,
        metadata: { eventId },
      }));

      await Notification.insertMany(notifications);
    } catch (error) {
      console.error("Error notifying admins:", error);
    }
  },

  async notifyAdminEventCompletion(eventId, eventTitle, ngoName, ngoId) {
    try {
      const admins = await require("../models/User.js").User.find({ role: "admin" });
      
      const notifications = admins.map((admin) => ({
        recipient: admin._id,
        sender: ngoId,
        type: "event_completion_request",
        title: "Event Completion Review Request",
        message: `${ngoName} has requested completion approval for "${eventTitle}"`,
        actionUrl: `/admin/eventendingreq`,
        metadata: { eventId },
      }));

      await Notification.insertMany(notifications);
    } catch (error) {
      console.error("Error notifying admins:", error);
    }
  },

  // NGO notifications
  async notifyNGOEventApproved(ngoId, eventId, eventTitle) {
    try {
      await Notification.create({
        recipient: ngoId,
        type: "event_approved",
        title: "Event Approved",
        message: `Your event "${eventTitle}" has been approved`,
        actionUrl: `/ngo-dashboard`,
        metadata: { eventId },
      });
    } catch (error) {
      console.error("Error notifying NGO:", error);
    }
  },

  async notifyNGOEventRejected(ngoId, eventId, eventTitle, reason = "") {
    try {
      await Notification.create({
        recipient: ngoId,
        type: "event_rejected",
        title: "Event Rejected",
        message: `Your event "${eventTitle}" was rejected. Reason: ${reason}`,
        actionUrl: `/ngo-dashboard`,
        metadata: { eventId },
      });
    } catch (error) {
      console.error("Error notifying NGO:", error);
    }
  },

  async notifyNGOParticipationRequest(ngoId, volunteerId, volunteerName, eventId, eventTitle) {
    try {
      await Notification.create({
        recipient: ngoId,
        sender: volunteerId,
        type: "participation_request",
        title: "New Participation Request",
        message: `${volunteerName} has requested to join "${eventTitle}"`,
        actionUrl: `/ngo-dashboard`,
        metadata: { eventId },
      });
    } catch (error) {
      console.error("Error notifying NGO:", error);
    }
  },

  async notifyNGOVolunteerJoined(ngoId, volunteerId, volunteerName, eventId, eventTitle) {
    try {
      await Notification.create({
        recipient: ngoId,
        sender: volunteerId,
        type: "volunteer_joined",
        title: "Volunteer Joined Event",
        message: `${volunteerName} has joined "${eventTitle}"`,
        actionUrl: `/ngo-dashboard`,
        metadata: { eventId },
      });
    } catch (error) {
      console.error("Error notifying NGO:", error);
    }
  },

  // Volunteer notifications
  async notifyVolunteerParticipationAccepted(volunteerId, eventId, eventTitle) {
    try {
      await Notification.create({
        recipient: volunteerId,
        type: "participation_accepted",
        title: "Participation Request Accepted",
        message: `Your request to join "${eventTitle}" has been accepted`,
        actionUrl: `/volunteer`,
        metadata: { eventId },
      });
    } catch (error) {
      console.error("Error notifying volunteer:", error);
    }
  },

  async notifyVolunteerParticipationRejected(volunteerId, eventId, eventTitle) {
    try {
      await Notification.create({
        recipient: volunteerId,
        type: "participation_rejected",
        title: "Participation Request Rejected",
        message: `Your request to join "${eventTitle}" has been rejected`,
        actionUrl: `/volunteer`,
        metadata: { eventId },
      });
    } catch (error) {
      console.error("Error notifying volunteer:", error);
    }
  },

  async notifyVolunteerPointsAwarded(volunteerId, eventId, eventTitle, points) {
    try {
      await Notification.create({
        recipient: volunteerId,
        type: "points_awarded",
        title: "Points Awarded",
        message: `You earned ${points} points for completing "${eventTitle}"`,
        actionUrl: `/profile`,
        metadata: { eventId, points },
      });
    } catch (error) {
      console.error("Error notifying volunteer:", error);
    }
  },

  async notifyVolunteerCertificateAwarded(volunteerId, eventId, eventTitle, certificateUrl) {
    try {
      await Notification.create({
        recipient: volunteerId,
        type: "certificate_awarded",
        title: "Certificate Awarded",
        message: `Your certificate for "${eventTitle}" is ready`,
        actionUrl: certificateUrl || `/profile`,
        metadata: { eventId, certificateUrl },
      });
    } catch (error) {
      console.error("Error notifying volunteer:", error);
    }
  },

  async notifyVolunteerBadgeEarned(volunteerId, badgeName) {
    try {
      await Notification.create({
        recipient: volunteerId,
        type: "badge_earned",
        title: "New Badge Earned",
        message: `Congratulations! You earned the "${badgeName}" badge`,
        actionUrl: `/badges`,
        metadata: { badgeName },
      });
    } catch (error) {
      console.error("Error notifying volunteer:", error);
    }
  },
};

export default {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
};

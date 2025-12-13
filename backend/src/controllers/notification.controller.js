import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

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
      console.log("[Notification] Finding admins for event approval notification...");
      const admins = await User.find({ role: "admin" });
      console.log(`[Notification] Found ${admins.length} admin(s)`);
      
      if (admins.length === 0) {
        console.log("[Notification] No admins found to notify");
        return;
      }
      
      const notifications = admins.map((admin) => ({
        recipient: admin._id,
        sender: ngoId,
        type: "event_approval_request",
        title: "New Event Approval Request",
        message: `${ngoName} has submitted "${eventTitle}" for approval`,
        actionUrl: `/admin/pendingrequest`,
        metadata: { eventId },
      }));

      const result = await Notification.insertMany(notifications);
      console.log(`[Notification] Created ${result.length} notification(s) for admins`);
    } catch (error) {
      console.error("Error notifying admins:", error);
    }
  },

  async notifyAdminEventCompletion(eventId, eventTitle, ngoName, ngoId) {
    try {
      const admins = await User.find({ role: "admin" });
      
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
  async notifyNGOEventSubmitted(ngoId, eventId, eventTitle) {
    try {
      await Notification.create({
        recipient: ngoId,
        type: "event_submitted",
        title: "Event Submitted for Review",
        message: `Your event "${eventTitle}" has been submitted to admin for approval`,
        actionUrl: `/volunteer`,
        metadata: { eventId },
      });
      console.log(`[Notification] Created event submission notification for NGO`);
    } catch (error) {
      console.error("Error notifying NGO about event submission:", error);
    }
  },

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

  // Corporate notifications
  async notifyCorporateEventSubmitted(corporateId, eventId, eventTitle) {
    try {
      await Notification.create({
        recipient: corporateId,
        type: "corporate_event_submitted",
        title: "Corporate Event Submitted",
        message: `Your corporate event "${eventTitle}" has been submitted for admin approval`,
        actionUrl: `/`,
        metadata: { eventId },
      });
      console.log(`[Notification] Created corporate event submission notification`);
    } catch (error) {
      console.error("Error notifying corporate about event submission:", error);
    }
  },

  async notifyCorporateEventApproved(corporateId, eventId, eventTitle) {
    try {
      await Notification.create({
        recipient: corporateId,
        type: "corporate_event_approved",
        title: "Corporate Event Approved",
        message: `Your corporate event "${eventTitle}" has been approved and is now live`,
        actionUrl: `/activities/${eventId}`,
        metadata: { eventId },
      });
      console.log(`[Notification] Created corporate event approval notification`);
    } catch (error) {
      console.error("Error notifying corporate about event approval:", error);
    }
  },

  async notifyCorporateEventRejected(corporateId, eventId, eventTitle, reason = "") {
    try {
      await Notification.create({
        recipient: corporateId,
        type: "corporate_event_rejected",
        title: "Corporate Event Rejected",
        message: reason 
          ? `Your corporate event "${eventTitle}" was rejected. Reason: ${reason}`
          : `Your corporate event "${eventTitle}" was rejected`,
        actionUrl: `/`,
        metadata: { eventId },
      });
      console.log(`[Notification] Created corporate event rejection notification`);
    } catch (error) {
      console.error("Error notifying corporate about event rejection:", error);
    }
  },

  async notifyCorporateNewEvent(eventId, eventTitle, creatorName) {
    try {
      // Notify all corporate users about a new approved corporate event
      const corporates = await User.find({ role: "corporate" });
      
      if (corporates.length === 0) {
        console.log("[Notification] No corporate users found to notify");
        return;
      }
      
      const notifications = corporates.map((corporate) => ({
        recipient: corporate._id,
        type: "new_corporate_event",
        title: "New CSR Opportunity Available!",
        message: `A new corporate partnership opportunity "${eventTitle}" has been posted by ${creatorName}. Explore this opportunity to make a positive impact!`,
        actionUrl: `/allcorporateevents`,
        metadata: { eventId },
      }));

      const result = await Notification.insertMany(notifications);
      console.log(`[Notification] Created ${result.length} notifications for corporate users`);
    } catch (error) {
      console.error("Error notifying corporate users:", error);
    }
  },

  async notifyAdminCorporateEventApproval(eventId, eventTitle, ngoName, ngoId) {
    try {
      console.log("[Notification] Finding admins for corporate event approval notification...");
      const admins = await User.find({ role: "admin" });
      console.log(`[Notification] Found ${admins.length} admin(s)`);
      
      if (admins.length === 0) {
        console.log("[Notification] No admins found to notify");
        return;
      }
      
      const notifications = admins.map((admin) => ({
        recipient: admin._id,
        sender: ngoId,
        type: "corporate_event_approval_request",
        title: "New Corporate Event Approval Request",
        message: `NGO "${ngoName}" has submitted corporate event "${eventTitle}" for approval`,
        actionUrl: `/pendingcorporateevent`,
        metadata: { eventId },
      }));

      const result = await Notification.insertMany(notifications);
      console.log(`[Notification] Created ${result.length} corporate event notification(s) for admins`);
    } catch (error) {
      console.error("Error notifying admins about corporate event:", error);
    }
  },

  // Corporate Interest Notifications
  async notifyCorporateInterestSent(corporateUserId, eventId, eventTitle) {
    try {
      await Notification.create({
        recipient: corporateUserId,
        type: "interest_sent",
        title: "Interest Sent Successfully",
        message: `Your interest in "${eventTitle}" has been sent to the organizing NGO. You will be notified when they respond.`,
        actionUrl: `/allcorporateevents`,
        metadata: { eventId },
      });
      console.log(`[Notification] Interest confirmation sent to corporate user`);
    } catch (error) {
      console.error("Error notifying corporate about interest sent:", error);
    }
  },

  async notifyNGONewCorporateInterest(ngoId, eventId, eventTitle, corporateName) {
    try {
      await Notification.create({
        recipient: ngoId,
        type: "new_corporate_interest",
        title: "New Corporate Interest Received",
        message: `${corporateName} has expressed interest in your corporate event "${eventTitle}"`,
        actionUrl: `/ngo-dashboard`,
        metadata: { eventId },
      });
      console.log(`[Notification] New interest notification sent to NGO`);
    } catch (error) {
      console.error("Error notifying NGO about new interest:", error);
    }
  },

  async notifyCorporateInterestResponse(corporateUserId, eventId, eventTitle, status) {
    try {
      const statusText = status === "accepted" ? "accepted" : "declined";
      await Notification.create({
        recipient: corporateUserId,
        type: `interest_${status}`,
        title: `Interest ${status === "accepted" ? "Accepted" : "Declined"}`,
        message: `The NGO has ${statusText} your interest in "${eventTitle}". ${status === "accepted" ? "They will contact you soon!" : "You can explore other events."}`,
        actionUrl: `/allcorporateevents`,
        metadata: { eventId },
      });
      console.log(`[Notification] Interest response notification sent to corporate user`);
    } catch (error) {
      console.error("Error notifying corporate about interest response:", error);
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

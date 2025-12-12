import { DonationEvent } from "../models/DonationEvent.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

export const createEventService = async (ngoId, eventData) => {
  const event = await DonationEvent.create({ ngoId, ...eventData, approvalStatus: "pending"  });
  
  // Create notifications for admins
  try {
    const admins = await User.find({ role: "admin" });
    const ngo = await User.findById(ngoId).select('name');
    
    if (admins.length > 0 && ngo) {
      const notifications = admins.map((admin) => ({
        recipient: admin._id,
        sender: ngoId,
        type: "donation_event_request",
        title: "New Donation Campaign Approval Request",
        message: `${ngo.name} has submitted "${event.title}" donation campaign for approval`,
        actionUrl: `/admin/donationpendingreq`,
        metadata: { eventId: event._id },
      }));

      await Notification.insertMany(notifications);
      console.log(`[Notification] Created ${notifications.length} notification(s) for donation event approval`);
    }
  } catch (error) {
    console.error("Error creating donation event notifications:", error);
  }
  
  return event;
};

export const getAllActiveEventsService = async () => {
  return DonationEvent.find({ status: "active", approvalStatus: "approved" })
    .populate("ngoId", "name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize")
    .sort({ createdAt: -1 });
};

export const getEventByIdService = async (eventId) => {
  const event = await DonationEvent.findById(eventId)
    .populate("ngoId", "name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize");
    
  if (!event) {
    throw new Error("Donation event not found");
  }
  
  return event;
};

export const getPendingEventsService = async () => {
  return DonationEvent.find({ approvalStatus: "pending" })
    .populate("ngoId", "name organizationType email")
    .sort({ createdAt: -1 });
};


export const updateEventApprovalService = async (eventId, status, rejectionReason = null) => {
  const event = await DonationEvent.findByIdAndUpdate(
    eventId,
    { 
      approvalStatus: status,
      ...(rejectionReason && { rejectionReason })
    },
    { new: true }
  ).populate('ngoId', 'name');
  
  // Create notification for NGO
  if (event && event.ngoId) {
    try {
      const notificationData = {
        recipient: event.ngoId._id,
        type: status === 'approved' ? 'event_approved' : 'event_rejected',
        title: status === 'approved' ? 'Donation Campaign Approved' : 'Donation Campaign Rejected',
        message: status === 'approved' 
          ? `Your donation campaign "${event.title}" has been approved and is now active.`
          : `Your donation campaign "${event.title}" has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
        actionUrl: `/ngo-dashboard`,
        metadata: { eventId: event._id },
      };
      
      await Notification.create(notificationData);
      console.log(`[Notification] Created ${status} notification for NGO`);
    } catch (error) {
      console.error("Error creating NGO notification:", error);
    }
  }
  
  return event;
};

export const getOrganizationEventsService = async (ngoId) => {
  return DonationEvent.find({ ngoId })
    .sort({ createdAt: -1 });
};

export const updateEventService = async (eventId, ngoId, updateData) => {
  const event = await DonationEvent.findOne({ _id: eventId, ngoId });
  
  if (!event) {
    return null;
  }
  
  // Update allowed fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      event[key] = updateData[key];
    }
  });
  
  await event.save();
  return event;
};

export const deleteEventService = async (eventId, ngoId) => {
  const event = await DonationEvent.findOneAndDelete({ _id: eventId, ngoId });
  return event;
};

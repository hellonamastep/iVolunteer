import { DonationEvent } from "../models/DonationEvent.js";

export const createEventService = async (ngoId, eventData) => {
  const event = await DonationEvent.create({ ngoId, ...eventData, approvalStatus: "pending"  });
  return event;
};

export const getAllActiveEventsService = async () => {
  return DonationEvent.find({ status: "active" })
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


export const updateEventApprovalService = async (eventId, status) => {
  return DonationEvent.findByIdAndUpdate(
    eventId,
    { approvalStatus: status },
    { new: true }
  );
};
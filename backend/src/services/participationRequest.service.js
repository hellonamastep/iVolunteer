import mongoose from "mongoose";
import { ParticipationRequest } from "../models/ParticipationRequest.js";
import { Event } from "../models/Event.js";
import { ApiError } from "../utils/ApiError.js";

// Create a participation request
const createParticipationRequest = async (eventId, userId, message = null) => {
  try {
    // Validate input parameters
    if (!eventId || !userId) {
      throw new ApiError(400, "Event ID and User ID are required");
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID format");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid user ID format");
    }

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    // Check if event is available for participation
    if (event.status !== "approved") {
      throw new ApiError(400, "Event is not available for participation");
    }

    if (event.date <= new Date()) {
      throw new ApiError(400, "Event has already started or ended");
    }

    // Check if user is the event creator
    if (event.organizationId.toString() === userId.toString()) {
      throw new ApiError(400, "Event creators cannot request participation in their own events");
    }

    // Check if user is already participating
    if (event.participants.includes(userId)) {
      throw new ApiError(400, "You are already participating in this event");
    }

    // Check if event is full
    if (event.participants.length >= event.maxParticipants) {
      throw new ApiError(400, "Event is full");
    }

    // Check for existing pending request
    const existingPendingRequest = await ParticipationRequest.findOne({
      eventId,
      userId,
      status: 'pending'
    });

    if (existingPendingRequest) {
      throw new ApiError(400, "You already have a pending participation request for this event");
    }

    // Check for existing rejected request
    const existingRejectedRequest = await ParticipationRequest.findOne({
      eventId,
      userId,
      status: 'rejected'
    });

    if (existingRejectedRequest) {
      // Update the existing rejected request to pending status with new message
      existingRejectedRequest.status = 'pending';
      existingRejectedRequest.message = message || null;
      existingRejectedRequest.rejectionReason = undefined; // Clear previous rejection reason
      
      await existingRejectedRequest.save();

      // Populate the request before returning
      await existingRejectedRequest.populate([
        { path: 'eventId', select: 'title date location organization' },
        { path: 'userId', select: 'name email' }
      ]);

      return existingRejectedRequest;
    }

    // Create the participation request
    const participationRequest = new ParticipationRequest({
      eventId,
      userId,
      eventCreatorId: event.organizationId,
      message: message || null,
    });

    await participationRequest.save();

    // Populate the request before returning
    await participationRequest.populate([
      { path: 'eventId', select: 'title date location organization' },
      { path: 'userId', select: 'name email' }
    ]);

    return participationRequest;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Failed to create participation request");
  }
};

// Get participation requests for an event creator
const getParticipationRequestsByCreator = async (eventCreatorId, status = 'pending') => {
  try {
    const requests = await ParticipationRequest.findByEventCreator(eventCreatorId, status);
    return requests;
  } catch (error) {
    throw new ApiError(500, "Failed to retrieve participation requests");
  }
};

// Get participation requests for a user
const getParticipationRequestsByUser = async (userId, status = null) => {
  try {
    const requests = await ParticipationRequest.findByUser(userId, status);
    return requests;
  } catch (error) {
    throw new ApiError(500, "Failed to retrieve user participation requests");
  }
};

// Get participation requests for a specific event
const getParticipationRequestsByEvent = async (eventId, status = null) => {
  try {
    const requests = await ParticipationRequest.findByEvent(eventId, status);
    return requests;
  } catch (error) {
    throw new ApiError(500, "Failed to retrieve event participation requests");
  }
};

// Update participation request status (accept/reject)
const updateParticipationRequestStatus = async (requestId, status, rejectionReason = null, eventCreatorId) => {
  try {
    if (!["accepted", "rejected"].includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }

    const request = await ParticipationRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, "Participation request not found");
    }

    // Verify that the user is the event creator
    if (request.eventCreatorId.toString() !== eventCreatorId.toString()) {
      throw new ApiError(403, "You are not authorized to update this participation request");
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      throw new ApiError(400, "This participation request has already been processed");
    }

    if (status === "accepted") {
      await request.accept();
    } else if (status === "rejected") {
      await request.reject(rejectionReason);
    }

    // Populate the updated request before returning
    await request.populate([
      { path: 'eventId', select: 'title date location organization' },
      { path: 'userId', select: 'name email' }
    ]);

    return request;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Failed to update participation request");
  }
};

// Cancel a participation request (by the user who made it)
const cancelParticipationRequest = async (requestId, userId) => {
  try {
    const request = await ParticipationRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, "Participation request not found");
    }

    // Verify that the user is the one who made the request
    if (request.userId.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to cancel this participation request");
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      throw new ApiError(400, "This participation request cannot be cancelled");
    }

    await ParticipationRequest.findByIdAndDelete(requestId);
    return { message: "Participation request cancelled successfully" };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || "Failed to cancel participation request");
  }
};

// Get participation request statistics for a creator
const getParticipationRequestStats = async (eventCreatorId) => {
  try {
    const stats = await ParticipationRequest.aggregate([
      { $match: { eventCreatorId: eventCreatorId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      total: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  } catch (error) {
    throw new ApiError(500, "Failed to retrieve participation request statistics");
  }
};

export const participationRequestService = {
  createParticipationRequest,
  getParticipationRequestsByCreator,
  getParticipationRequestsByUser,
  getParticipationRequestsByEvent,
  updateParticipationRequestStatus,
  cancelParticipationRequest,
  getParticipationRequestStats,
};
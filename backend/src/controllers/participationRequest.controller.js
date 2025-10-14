import { participationRequestService } from "../services/participationRequest.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a participation request
const createParticipationRequest = asyncHandler(async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user?._id;
  const { message } = req.body;

  // Validate eventId parameter
  if (!eventId) {
    return res.status(400).json({ 
      success: false, 
      message: "Event ID is required" 
    });
  }

  // Validate user authentication
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: "User not authenticated" 
    });
  }

  const participationRequest = await participationRequestService.createParticipationRequest(
    eventId,
    userId,
    message
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        participationRequest,
        "Participation request submitted successfully"
      )
    );
});

// Get participation requests for the authenticated event creator
const getMyParticipationRequests = asyncHandler(async (req, res) => {
  const eventCreatorId = req.user._id;
  const { status } = req.query;

  const requests = await participationRequestService.getParticipationRequestsByCreator(
    eventCreatorId,
    status || 'pending'
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        requests,
        "Participation requests retrieved successfully"
      )
    );
});

// Get participation requests made by the authenticated user
const getUserParticipationRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status } = req.query;

  const requests = await participationRequestService.getParticipationRequestsByUser(
    userId,
    status
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        requests,
        "User participation requests retrieved successfully"
      )
    );
});

// Get participation requests for a specific event (for event creator)
const getEventParticipationRequests = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { status } = req.query;
  const userId = req.user._id;

  // Verify that the user is the event creator
  const { Event } = await import("../models/Event.js");
  const event = await Event.findById(eventId);
  
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (event.organizationId.toString() !== userId.toString()) {
    return res.status(403).json({ 
      success: false, 
      message: "You are not authorized to view these participation requests" 
    });
  }

  const requests = await participationRequestService.getParticipationRequestsByEvent(
    eventId,
    status
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        requests,
        "Event participation requests retrieved successfully"
      )
    );
});

// Update participation request status (accept/reject)
const updateParticipationRequestStatus = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, rejectionReason } = req.body;
  const eventCreatorId = req.user._id;

  const updatedRequest = await participationRequestService.updateParticipationRequestStatus(
    requestId,
    status,
    rejectionReason,
    eventCreatorId
  );

  const message = status === "accepted" 
    ? "Participation request accepted successfully"
    : "Participation request rejected successfully";

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedRequest, message)
    );
});

// Cancel a participation request (by the user who made it)
const cancelParticipationRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const result = await participationRequestService.cancelParticipationRequest(
    requestId,
    userId
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Participation request cancelled successfully")
    );
});

// Get participation request statistics
const getParticipationRequestStats = asyncHandler(async (req, res) => {
  const eventCreatorId = req.user._id;

  const stats = await participationRequestService.getParticipationRequestStats(
    eventCreatorId
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        stats,
        "Participation request statistics retrieved successfully"
      )
    );
});

export const participationRequestController = {
  createParticipationRequest,
  getMyParticipationRequests,
  getUserParticipationRequests,
  getEventParticipationRequests,
  updateParticipationRequestStatus,
  cancelParticipationRequest,
  getParticipationRequestStats,
};
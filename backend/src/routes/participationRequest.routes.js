import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { participationRequestController } from "../controllers/participationRequest.controller.js";

const participationRequestRouter = express.Router();

// Create participation request for an event
participationRequestRouter.post(
  "/event/:eventId",
  authMiddleware,
  participationRequestController.createParticipationRequest
);

// Get participation requests for the authenticated event creator
participationRequestRouter.get(
  "/my-requests",
  authMiddleware,
  participationRequestController.getMyParticipationRequests
);

// Get participation requests made by the authenticated user
participationRequestRouter.get(
  "/user-requests",
  authMiddleware,
  participationRequestController.getUserParticipationRequests
);

// Get participation requests for a specific event (for event creator)
participationRequestRouter.get(
  "/event/:eventId/requests",
  authMiddleware,
  participationRequestController.getEventParticipationRequests
);

// Update participation request status (accept/reject)
participationRequestRouter.put(
  "/:requestId/status",
  authMiddleware,
  participationRequestController.updateParticipationRequestStatus
);

// Cancel participation request (by the user who made it)
participationRequestRouter.delete(
  "/:requestId",
  authMiddleware,
  participationRequestController.cancelParticipationRequest
);

// Get participation request statistics
participationRequestRouter.get(
  "/stats",
  authMiddleware,
  participationRequestController.getParticipationRequestStats
);

export default participationRequestRouter;
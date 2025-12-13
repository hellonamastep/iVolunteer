import express from "express";
import {
  authMiddleware,
  authorizeRole,
} from "../middlewares/auth.middleware.js";
import { ngoEventController } from "../controllers/ngoEvent.controller.js";
import { Event } from "../models/Event.js";
import { upload } from "../config/cloudinary.js";

const eventRouter = express.Router();

/* ---------------- NGO ROUTES ---------------- */

// Add a new event
eventRouter.post("/add-event", authMiddleware, ngoEventController.addEvent);

// Upload event image
eventRouter.post(
  "/upload-event-image",
  authMiddleware,
  upload.single("eventImage"),
  ngoEventController.uploadEventImage
);

// Get user's default location for event creation
eventRouter.get(
  "/default-location",
  authMiddleware,
  ngoEventController.getDefaultLocation
);

// Get all published events
eventRouter.get("/all-event", ngoEventController.getAllPublishedEvents);

// Get sponsorship-related events
eventRouter.get("/sponsorship", ngoEventController.getSponsorshipEvents);

// Get events by organization (specific NGO)
eventRouter.get(
  "/organization",
  authMiddleware,
  ngoEventController.getEventsByOrganization
);

// Get archived events for current NGO
eventRouter.get(
  "/archived-events",
  authMiddleware,
  authorizeRole("ngo"),
  ngoEventController.getArchivedEvents
);

// Participation-related routes
eventRouter.post(
  "/participate/:eventId",
  authMiddleware,
  ngoEventController.participateInEvent
);
eventRouter.post(
  "/request-participation/:eventId",
  authMiddleware,
  ngoEventController.requestParticipation
);
eventRouter.delete(
  "/leave/:eventId",
  authMiddleware,
  ngoEventController.leaveEvent
);

// NGO ends event (requests completion)
eventRouter.post(
  "/end/:eventId",
  authMiddleware,
  authorizeRole("ngo"),
  upload.single("completionProof"),
  ngoEventController.requestCompletion
);

// Migrate participants (debug/maintenance)
eventRouter.post(
  "/migrate-participants",
  authMiddleware,
  ngoEventController.migrateParticipantsData
);

/* ---------------- ADMIN ROUTES ---------------- */

// Get all pending events
eventRouter.get(
  "/pending",
  authMiddleware,
  authorizeRole("admin"),
  ngoEventController.getPendingEvents
);

// Get all pending corporate events
eventRouter.get(
  "/pending-corporate",
  authMiddleware,
  authorizeRole("admin"),
  ngoEventController.getPendingCorporateEvents
);

// Get all approved corporate events (for corporate dashboard)
eventRouter.get(
  "/approved-corporate",
  authMiddleware,
  authorizeRole("corporate"),
  ngoEventController.getApprovedCorporateEvents
);

// Approve / reject event
eventRouter.put(
  "/status/:eventId",
  authMiddleware,
  authorizeRole("admin"),
  ngoEventController.updateEventStatus
);

// Get all end-event completion requests
eventRouter.get(
  "/review-completion",
  authMiddleware,
  authorizeRole("admin"),
  ngoEventController.getAllCompletionRequests
);

// Review / Approve / Reject completion request
eventRouter.put(
  "/review-completion/:eventId",
  authMiddleware,
  authorizeRole("admin"),
  ngoEventController.reviewCompletion
);

// Completion history (admin)
eventRouter.get(
  "/history/completion-requests",
  authMiddleware,
  authorizeRole("admin"),
  ngoEventController.getCompletionRequestHistory
);

// Completed events by NGO
eventRouter.get(
  "/history/completed-events/:ngoId",
  authMiddleware,
  authorizeRole("admin"),
  ngoEventController.getCompletedEventsByNgo
);

// Approve with scoring
eventRouter.put(
  "/admin/approve-with-scoring/:eventId",
  authMiddleware,
  authorizeRole("admin"),
  ngoEventController.approveEventWithScoring
);

/* ---------------- DEBUG ROUTE ---------------- */

eventRouter.post(
  "/test-create",
  authMiddleware,
  authorizeRole("ngo"),
  async (req, res) => {
    try {
      console.log("[DEBUG] Test event creation - User:", req.user._id, req.user.name);

      const testEvent = {
        title: "Test Event - " + new Date().toISOString(),
        description: "This is a test event created for debugging",
        organization: req.user.name,
        organizationId: req.user._id,
        location: "Test Location",
        date: new Date(Date.now() + 86400000), // Tomorrow
        time: "10:00",
        duration: 2,
        category: "community",
        maxParticipants: 10,
        pointsOffered: 50,
        sponsorshipRequired: false,
      };

      const event = await Event.create(testEvent);
      console.log("[DEBUG] Test event created:", event._id);

      res.json({
        success: true,
        message: "Test event created successfully",
        event,
      });
    } catch (error) {
      console.error("[DEBUG] Test event creation failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create test event",
        error: error.message,
      });
    }
  }
);

/* ---------------- DYNAMIC ROUTES (MUST BE LAST) ---------------- */

// Get event participants data (for creator only)
eventRouter.get(
  "/:eventId/participants",
  authMiddleware,
  ngoEventController.getEventParticipants
);

// Get single event by ID
eventRouter.get("/:eventId", ngoEventController.getEventById);

// Update event (for organization owners)
eventRouter.put("/:eventId", authMiddleware, ngoEventController.updateEvent);

// Delete event (for organization owners)
eventRouter.delete("/:eventId", authMiddleware, ngoEventController.deleteEvent);

export default eventRouter;

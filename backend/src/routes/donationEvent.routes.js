import express from "express";
import {
  authMiddleware,
  authorizeRole,
} from "../middlewares/auth.middleware.js";
import {
  createEvent,
  getAllEvents, getEventById,
  getPendingEvents,
  updateEventApproval,
  getOrganizationEvents,
} from "../controllers/donationEvent.controller.js";
import { upload } from "../config/cloudinary.js";

const donationEventRouter = express.Router();

// Handle multiple file uploads for donation event
donationEventRouter.post(
  "/create-event", 
  authMiddleware, 
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 },
    { name: 'proofOfNeed', maxCount: 1 },
    { name: 'supportingMedia', maxCount: 5 }
  ]),
  createEvent
);
donationEventRouter.get("/getallevent", getAllEvents);

// NGO routes - get their own events
donationEventRouter.get(
  "/organization/events",
  authMiddleware,
  getOrganizationEvents
);

// 👇 Admin routes
donationEventRouter.get(
  "/pending",
  authMiddleware,
  
  getPendingEvents
);
donationEventRouter.patch(
  "/status/:eventId",
  authMiddleware,
  authorizeRole("admin"),
  updateEventApproval
);
donationEventRouter.get("/:eventId", getEventById); // Get single donation event

export default donationEventRouter;

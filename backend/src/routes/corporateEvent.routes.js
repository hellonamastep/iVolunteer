import express from "express";
import multer from "multer";
import { adminEventController } from "../controllers/adminEvent.controller.js";
import { corporateEventController } from "../controllers/corporateEvent.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";

const corporateEventRouter = express.Router();
const upload = multer({ dest: "uploads/events" });

// NGO user routes - create CSR opportunity
corporateEventRouter.post("/", authMiddleware, corporateEventController.createEvent);

// Get pending CSR opportunities (for admin)
corporateEventRouter.get("/pending", authMiddleware, authorizeRole("admin"), corporateEventController.getPendingEvents);

// Get approved CSR opportunities (for corporates to browse)
corporateEventRouter.get("/approved", authMiddleware, authorizeRole("corporate", "ngo", "admin"), corporateEventController.getApprovedEvents);

// Get NGO's own CSR opportunities
corporateEventRouter.get("/my-events", authMiddleware, corporateEventController.getEventsByNgo);

// Delete CSR opportunity (NGO can delete their own)
corporateEventRouter.delete("/:id", authMiddleware, authorizeRole("ngo", "admin"), corporateEventController.deleteEvent);

// Admin routes - with specific paths first
corporateEventRouter.post("/create",authMiddleware ,authorizeRole("admin"), upload.single("image"), adminEventController.createEvent);
corporateEventRouter.get("/allevents", adminEventController.getEvents);
corporateEventRouter.get("/bids/:id",authMiddleware ,authorizeRole("admin"), adminEventController.getBids);
corporateEventRouter.post("/select-bid",authMiddleware ,authorizeRole("admin"), adminEventController.selectBid);
corporateEventRouter.delete("/delete/:id",authMiddleware ,authorizeRole("admin"), adminEventController.deleteEvent);

// Approve/Reject CSR opportunities (admin) - must come before /:id
corporateEventRouter.put("/approve/:id", authMiddleware, authorizeRole("admin"), corporateEventController.approveEvent);
corporateEventRouter.put("/reject/:id", authMiddleware, authorizeRole("admin"), corporateEventController.rejectEvent);

// Get single CSR opportunity by ID - must be last
corporateEventRouter.get("/:id", corporateEventController.getEventById);



export default corporateEventRouter;

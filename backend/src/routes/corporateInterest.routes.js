import express from "express";
import { authMiddleware, authorizeRole } from "../middlewares/auth.middleware.js";
import { CorporateInterest } from "../models/CorporateInterest.js";
import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { notificationService } from "../controllers/notification.controller.js";

const corporateInterestRouter = express.Router();

// Corporate user expresses interest in an event
corporateInterestRouter.post(
  "/express-interest/:eventId",
  authMiddleware,
  authorizeRole("corporate"),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const message = req.body?.message || "";
      const corporateUserId = req.user._id;

      console.log("=== EXPRESS INTEREST DEBUG ===");
      console.log("Event ID:", eventId);
      console.log("Corporate User ID:", corporateUserId);
      console.log("Corporate User Role:", req.user.role);
      console.log("Request body:", req.body);
      console.log("Message:", message);

      // Get the event details
      const event = await Event.findById(eventId).populate("organizationId", "name email");
      console.log("Event found:", event ? "YES" : "NO");
      if (event) {
        console.log("Event title:", event.title);
        console.log("Event organizationId:", event.organizationId);
        console.log("Event organizationId type:", typeof event.organizationId);
        console.log("Event organizationId is Object:", event.organizationId instanceof Object);
      }
      
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }

      // Get NGO ID - handle both populated and non-populated cases
      let ngoId;
      if (event.organizationId) {
        if (typeof event.organizationId === 'object' && event.organizationId._id) {
          ngoId = event.organizationId._id;
        } else {
          ngoId = event.organizationId;
        }
      }
      
      console.log("Extracted NGO ID:", ngoId);
      console.log("NGO ID type:", typeof ngoId);
      
      if (!ngoId) {
        return res.status(400).json({ 
          success: false, 
          message: "Event does not have an associated organization" 
        });
      }

      // Check if already expressed interest
      const existingInterest = await CorporateInterest.findOne({
        event: eventId,
        corporateUser: corporateUserId,
      });

      console.log("Existing interest:", existingInterest ? "YES" : "NO");

      if (existingInterest) {
        return res.status(400).json({
          success: false,
          message: "You have already expressed interest in this event",
        });
      }

      // Get corporate user details
      const corporateUser = await User.findById(corporateUserId);
      console.log("Corporate user found:", corporateUser ? "YES" : "NO");
      if (corporateUser) {
        console.log("Corporate user name:", corporateUser.name);
      }
      
      if (!corporateUser) {
        return res.status(404).json({ success: false, message: "Corporate user not found" });
      }

      // Create interest
      console.log("Creating interest with:", { event: eventId, corporateUser: corporateUserId, ngoId, message });
      const interest = await CorporateInterest.create({
        event: eventId,
        corporateUser: corporateUserId,
        ngoId: ngoId,
        message: message || "",
      });
      console.log("Interest created successfully:", interest._id);

      // Send notification to corporate user (confirmation)
      console.log("Sending notification to corporate user...");
      await notificationService.notifyCorporateInterestSent(
        corporateUserId,
        event._id,
        event.title
      );

      // Send notification to NGO (new interest received)
      console.log("Sending notification to NGO...");
      await notificationService.notifyNGONewCorporateInterest(
        ngoId,
        event._id,
        event.title,
        corporateUser.name || "A corporate organization"
      );

      console.log("=== EXPRESS INTEREST SUCCESS ===");
      res.status(201).json({
        success: true,
        message: "Interest expressed successfully",
        interest,
      });
    } catch (error) {
      console.error("=== EXPRESS INTEREST ERROR ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Error name:", error.name);
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "You have already expressed interest in this event",
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to express interest",
        error: error.message,
      });
    }
  }
);

// Get all interests for an NGO (for their events)
corporateInterestRouter.get(
  "/ngo-interests",
  authMiddleware,
  authorizeRole("ngo"),
  async (req, res) => {
    try {
      const ngoId = req.user._id;
      console.log("=== FETCH NGO INTERESTS DEBUG ===");
      console.log("NGO ID:", ngoId);

      const interests = await CorporateInterest.find({ ngoId })
        .populate("event", "title date location city image category")
        .populate("corporateUser", "name email contactNumber companyType industrySector companySize")
        .sort({ createdAt: -1 });

      console.log("Found interests count:", interests.length);
      console.log("=== NGO INTERESTS SUCCESS ===");

      res.status(200).json({
        success: true,
        interests,
        count: interests.length,
      });
    } catch (error) {
      console.error("=== FETCH NGO INTERESTS ERROR ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        success: false,
        message: "Failed to fetch interests",
        error: error.message,
      });
    }
  }
);

// Get interests for a specific event (for NGO)
corporateInterestRouter.get(
  "/event/:eventId",
  authMiddleware,
  authorizeRole("ngo"),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const ngoId = req.user._id;

      // Verify the event belongs to this NGO
      const event = await Event.findById(eventId);
      if (!event || event.organizationId.toString() !== ngoId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const interests = await CorporateInterest.find({ event: eventId })
        .populate("corporateUser", "name email organizationName contactNumber")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        interests,
        count: interests.length,
      });
    } catch (error) {
      console.error("Error fetching event interests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch interests",
        error: error.message,
      });
    }
  }
);

// Corporate user gets their expressed interests
corporateInterestRouter.get(
  "/my-interests",
  authMiddleware,
  authorizeRole("corporate"),
  async (req, res) => {
    try {
      const corporateUserId = req.user._id;

      const interests = await CorporateInterest.find({ corporateUser: corporateUserId })
        .populate("event", "title date location city image category")
        .populate("ngoId", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        interests,
        count: interests.length,
      });
    } catch (error) {
      console.error("Error fetching corporate interests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch interests",
        error: error.message,
      });
    }
  }
);

// NGO responds to an interest (accept/reject)
corporateInterestRouter.put(
  "/respond/:interestId",
  authMiddleware,
  authorizeRole("ngo"),
  async (req, res) => {
    try {
      const { interestId } = req.params;
      const { status, responseMessage } = req.body;
      const ngoId = req.user._id;

      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be 'accepted' or 'rejected'",
        });
      }

      const interest = await CorporateInterest.findById(interestId)
        .populate("event", "title")
        .populate("corporateUser", "name");

      if (!interest) {
        return res.status(404).json({
          success: false,
          message: "Interest not found",
        });
      }

      // Verify the interest is for an event owned by this NGO
      if (interest.ngoId.toString() !== ngoId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      interest.status = status;
      interest.respondedAt = new Date();
      interest.responseMessage = responseMessage || "";
      await interest.save();

      // Notify corporate user about the response
      await notificationService.notifyCorporateInterestResponse(
        interest.corporateUser._id,
        interest.event._id,
        interest.event.title,
        status
      );

      res.status(200).json({
        success: true,
        message: `Interest ${status} successfully`,
        interest,
      });
    } catch (error) {
      console.error("Error responding to interest:", error);
      res.status(500).json({
        success: false,
        message: "Failed to respond to interest",
        error: error.message,
      });
    }
  }
);

// Check if corporate user has already expressed interest in an event
corporateInterestRouter.get(
  "/check/:eventId",
  authMiddleware,
  authorizeRole("corporate"),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const corporateUserId = req.user._id;

      const interest = await CorporateInterest.findOne({
        event: eventId,
        corporateUser: corporateUserId,
      });

      res.status(200).json({
        success: true,
        hasInterest: !!interest,
        interest: interest || null,
      });
    } catch (error) {
      console.error("Error checking interest:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check interest",
        error: error.message,
      });
    }
  }
);

export default corporateInterestRouter;

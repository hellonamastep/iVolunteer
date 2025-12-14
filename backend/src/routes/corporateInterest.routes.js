import express from "express";
import { authMiddleware, authorizeRole } from "../middlewares/auth.middleware.js";
import { CorporateInterest } from "../models/CorporateInterest.js";
import { Event } from "../models/Event.js";
import { corporateEvent } from "../models/Corporateevent.js";
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

      // Try to get the event from Event model first
      let event = await Event.findById(eventId).populate("organizationId", "name email");
      let isCsrOpportunity = false;
      
      console.log("Event found in Event model:", event ? "YES" : "NO");
      
      // If not found in Event model, try CorporateEvent model (CSR opportunities)
      if (!event) {
        event = await corporateEvent.findById(eventId).populate("ngoId", "name email organizationName");
        isCsrOpportunity = true;
        console.log("Event found in CorporateEvent model:", event ? "YES" : "NO");
      }
      
      if (event) {
        console.log("Event title:", event.title);
        console.log("Event type:", isCsrOpportunity ? "CSR Opportunity" : "Regular Event");
        console.log("Event organizationId/ngoId:", isCsrOpportunity ? event.ngoId : event.organizationId);
      }
      
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }

      // Get NGO ID - handle both Event and CorporateEvent models
      let ngoId;
      const orgField = isCsrOpportunity ? event.ngoId : event.organizationId;
      
      if (orgField) {
        if (typeof orgField === 'object' && orgField._id) {
          ngoId = orgField._id;
        } else {
          ngoId = orgField;
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
      console.log("User role:", req.user.role);

      // Double check user is NGO (middleware should have already validated)
      if (req.user.role !== "ngo") {
        console.log("=== ACCESS DENIED: User is not an NGO ===");
        return res.status(403).json({
          success: false,
          message: "Access denied. This feature is only available for NGO accounts.",
        });
      }

      // Fetch interests without populating event first
      const interests = await CorporateInterest.find({ ngoId })
        .populate("corporateUser", "name email contactNumber companyType industrySector companySize")
        .sort({ createdAt: -1 });

      console.log("Found interests count:", interests.length);

      // Manually populate event from both Event and CorporateEvent models
      const populatedInterests = await Promise.all(
        interests.map(async (interest) => {
          const interestObj = interest.toObject();
          
          // Try to find in Event model first
          let event = await Event.findById(interest.event).select("title date location city image category");
          
          // If not found in Event model, try CorporateEvent model
          if (!event) {
            event = await corporateEvent.findById(interest.event).select("title location coverImage opportunityType timeline");
            
            // Map CorporateEvent fields to match Event structure
            if (event) {
              const locationDisplay = event.location?.city && event.location?.state 
                ? `${event.location.city}, ${event.location.district}, ${event.location.state} - ${event.location.pincode}`
                : event.city && event.state 
                ? `${event.city}, ${event.state}` 
                : 'Location not specified';
              
              event = {
                _id: event._id,
                title: event.title,
                date: event.timeline?.startDate || event.createdAt,
                location: locationDisplay,
                city: event.location?.city || event.city,
                state: event.location?.state || event.state,
                district: event.location?.district,
                pincode: event.location?.pincode,
                googleMapLocation: event.location?.googleMapLocation,
                image: event.coverImage,
                category: event.opportunityType || "CSR Partnership"
              };
            }
          }
          
          return {
            ...interestObj,
            event: event
          };
        })
      );

      console.log("=== NGO INTERESTS SUCCESS ===");

      res.status(200).json({
        success: true,
        interests: populatedInterests,
        count: populatedInterests.length,
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
        .populate("corporateUser", "name email");

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

      // Get event details from either Event or CorporateEvent model
      let event = await Event.findById(interest.event).select("title");
      if (!event) {
        event = await corporateEvent.findById(interest.event).select("title");
      }

      const eventTitle = event?.title || "Event";
      const corporateUserId = interest.corporateUser?._id || interest.corporateUser;

      interest.status = status;
      interest.respondedAt = new Date();
      interest.responseMessage = responseMessage || "";
      await interest.save();

      // Notify corporate user about the response
      try {
        await notificationService.notifyCorporateInterestResponse(
          corporateUserId,
          interest.event,
          eventTitle,
          status
        );
        console.log(`Notification sent to corporate user ${corporateUserId} for ${status} interest`);
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Don't fail the request if notification fails
      }

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

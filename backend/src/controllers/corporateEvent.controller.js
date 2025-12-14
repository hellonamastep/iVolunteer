import { corporateEventService } from "../services/corporateEvent.service.js";
import { notificationService } from "./notification.controller.js";

class CorporateEventController {
  // Create a new CSR opportunity (NGO users)
  async createEvent(req, res) {
    try {
      const data = req.body;
      // Set ngoId from authenticated user
      data.ngoId = req.user._id;
      // Set initial status as pending for admin approval
      data.status = "pending";

      const event = await corporateEventService.createEvent(data);
      
      // Send notification to admins about new CSR opportunity
      try {
        console.log("[CreateCSROpportunity] Sending notification to admins for:", event.title);
        console.log("[CreateCSROpportunity] NGO User:", {
          id: req.user._id,
          name: req.user.name,
          organizationName: req.user.organizationName,
          email: req.user.email
        });
        
        // Use organizationName if available, otherwise fall back to name
        const ngoName = req.user.organizationName || req.user.name || 'NGO';
        
        await notificationService.notifyAdminCorporateEventApproval(
          event._id,
          event.title,
          ngoName,
          req.user._id
        );
        console.log("[CreateCSROpportunity] Notification sent successfully to admins");
        
        // Notify the NGO that their CSR opportunity was submitted
        await notificationService.notifyNGOEventSubmitted(
          req.user._id,
          event._id,
          event.title
        );
        console.log("[CreateCSROpportunity] Confirmation notification sent to NGO");
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
        console.error("Notification error stack:", notificationError.stack);
        // Don't fail the request if notification fails
      }
      
      res.status(201).json({ success: true, event });
    } catch (err) {
      console.error("Create CSR Event Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get all events
  async getEvents(req, res) {
    try {
      const events = await corporateEventService.getAllEvents();
      res.status(200).json({ success: true, events });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get single event by ID
  async getEventById(req, res) {
    try {
      const event = await corporateEventService.getEventById(req.params.id);
      if (!event)
        return res.status(404).json({ success: false, message: "Event not found" });

      res.status(200).json({ success: true, event });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Update event
  async updateEvent(req, res) {
    try {
      const data = req.body;
      if (req.file) data.image = req.file.path;

      const event = await corporateEventService.updateEvent(req.params.id, data);
      if (!event)
        return res.status(404).json({ success: false, message: "Event not found" });

      res.status(200).json({ success: true, event });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Delete event
  async deleteEvent(req, res) {
    try {
      // First, fetch the event to check ownership
      const event = await corporateEventService.getEventById(req.params.id);
      if (!event)
        return res.status(404).json({ success: false, message: "Event not found" });

      // Check if user is admin or the NGO who created the event
      // event.ngoId is populated, so we need to access ._id
      const eventNgoId = event.ngoId?._id ? event.ngoId._id.toString() : event.ngoId.toString();
      if (req.user.role !== 'admin' && eventNgoId !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "You are not authorized to delete this event" });
      }

      await corporateEventService.deleteEvent(req.params.id);
      res.status(200).json({ success: true, message: "Event deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get all events created by a specific admin
  async getEventsByAdmin(req, res) {
    try {
      const events = await corporateEventService.getEventsByAdmin(req.user.id);
      res.status(200).json({ success: true, events });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get all events created by a specific NGO
  async getEventsByNgo(req, res) {
    try {
      const events = await corporateEventService.getEventsByNgo(req.user._id);
      res.status(200).json({ success: true, events });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get pending CSR opportunities (for admin)
  async getPendingEvents(req, res) {
    try {
      const events = await corporateEventService.getPendingEvents();
      res.status(200).json({ success: true, events });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get approved CSR opportunities (for corporates to browse)
  async getApprovedEvents(req, res) {
    try {
      const events = await corporateEventService.getApprovedEvents();
      res.status(200).json({ success: true, events });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Approve CSR opportunity (admin)
  async approveEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await corporateEventService.updateEvent(id, { status: 'approved' });
      
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      // Notify NGO that their CSR opportunity was approved
      // event.ngoId is populated, so we need to get the _id from it
      const ngoId = event.ngoId?._id || event.ngoId;
      const ngoName = event.ngoId?.organizationName || event.ngoId?.name || 'NGO';
      
      try {
        await notificationService.notifyNGOEventApproved(
          ngoId,
          event._id,
          event.title
        );
        console.log("[ApproveCSROpportunity] Notification sent to NGO:", ngoId);
      } catch (notificationError) {
        console.error("Error sending approval notification to NGO:", notificationError);
      }

      // Notify ALL corporate users about the new CSR opportunity
      try {
        await notificationService.notifyCorporateNewEvent(
          event._id,
          event.title,
          ngoName
        );
        console.log("[ApproveCSROpportunity] Notification sent to all corporate users for event:", event.title);
      } catch (notificationError) {
        console.error("Error sending notification to corporate users:", notificationError);
      }

      res.status(200).json({ success: true, event });
    } catch (err) {
      console.error("Approve CSR Event Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Reject CSR opportunity (admin)
  async rejectEvent(req, res) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      
      const event = await corporateEventService.updateEvent(id, { 
        status: 'rejected',
        rejectionReason: rejectionReason || 'No reason provided'
      });
      
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      // Notify NGO that their CSR opportunity was rejected
      // event.ngoId is populated, so we need to get the _id from it
      const ngoId = event.ngoId?._id || event.ngoId;
      try {
        await notificationService.notifyNGOEventRejected(
          ngoId,
          event._id,
          event.title,
          rejectionReason
        );
        console.log("[RejectCSROpportunity] Notification sent to NGO:", ngoId);
      } catch (notificationError) {
        console.error("Error sending rejection notification:", notificationError);
      }

      res.status(200).json({ success: true, event });
    } catch (err) {
      console.error("Reject CSR Event Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // TODO: add bid-related methods if needed
}

export const corporateEventController = new CorporateEventController();

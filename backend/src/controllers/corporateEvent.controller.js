import { corporateEventService } from "../services/corporateEvent.service.js";

class CorporateEventController {
  // Create a new event
  async createEvent(req, res) {
    try {
      const data = req.body;
      if (req.file) data.image = req.file.path;
      data.referenceId = req.user.id; // from auth middleware

      const event = await corporateEventService.createEvent(data);
      res.status(201).json({ success: true, event });
    } catch (err) {
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
      const event = await corporateEventService.deleteEvent(req.params.id);
      if (!event)
        return res.status(404).json({ success: false, message: "Event not found" });

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

  // TODO: add bid-related methods if needed
}

export const adminEventController = new CorporateEventController();

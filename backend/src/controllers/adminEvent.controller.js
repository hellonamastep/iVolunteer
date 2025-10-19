import { adminEventService } from "../services/adminEvent.service.js";

export const adminEventController = {
  // ✅ Create event
  async createEvent(req, res) {
    try {
      const data = req.body;
      if (req.file) data.image = req.file.path;
      data.referenceId = req.user.id; // admin ID

      const event = await adminEventService.createEvent(data);
      res.status(201).json({ success: true, event });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ✅ Get all events
  async getEvents(req, res) {
    try {
      const events = await adminEventService.getAllEvents();
      res.json({ success: true, events });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ✅ Get single event
  async getEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await adminEventService.getEventById(id);
      res.json({ success: true, event });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // ✅ Delete event
  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      const deletedEvent = await adminEventService.deleteEvent(id);
      res.json({
        success: true,
        message: "Event deleted successfully",
        deletedEvent,
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  // ✅ Get all bids for a specific event
  async getBids(req, res) {
    try {
      const { id } = req.params;
      const bids = await adminEventService.getBidsForEvent(id);
      res.json({ success: true, bids });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ✅ Select bid
  async selectBid(req, res) {
    try {
      const { eventId, bidId } = req.body;
      const event = await adminEventService.selectBid(eventId, bidId);
      res.json({
        success: true,
        message: "Bid selected and event closed successfully",
        event,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

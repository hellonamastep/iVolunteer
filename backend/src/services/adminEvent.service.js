import { corporateEvent } from "../models/Corporateevent.js";
import { Bid } from "../models/Bid.js";

export const adminEventService = {
  // ✅ Create new event
  async createEvent(data) {
    return await corporateEvent.create(data);
  },

  // ✅ Get all events
  async getAllEvents() {
    return await corporateEvent.find().populate("selectedBid");
  },

  // ✅ Get specific event by ID
  async getEventById(eventId) {
    const event = await corporateEvent
      .findById(eventId)
      .populate("selectedBid");
    if (!event) throw new Error("Event not found");
    return event;
  },

  // ✅ Delete event by ID
  async deleteEvent(eventId) {
    const event = await corporateEvent.findByIdAndDelete(eventId);
    if (!event) throw new Error("Event not found");
    // Optionally delete all related bids too:
    await Bid.deleteMany({ event: eventId });
    return event;
  },

  // ✅ Get all bids for a specific event
  async getBidsForEvent(eventId) {
    return await Bid.find({ event: eventId }).populate("corporate");
  },

  // ✅ Select a bid and close event
  async selectBid(eventId, bidId) {
    const event = await corporateEvent.findById(eventId);
    if (!event) throw new Error("Event not found");

    const bid = await Bid.findById(bidId);
    if (!bid) throw new Error("Bid not found");

    // Close event
    event.status = "closed";
    event.selectedBid = bidId;
    await event.save();

    // Reject all other bids
    await Bid.updateMany({ event: eventId }, { status: "rejected" });

    // Mark selected bid
    bid.status = "selected";
    await bid.save();

    return event;
  },
};

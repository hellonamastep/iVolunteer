// corporateBidService.js
import { corporateEvent } from "../models/Corporateevent.js";

export const corporateBidService = {
  async placeBid({ eventId, corporateName, offer, contactEmail, contactNumber, corporate }) {
    const event = await corporateEvent.findById(eventId);
    if (!event || event.status === "closed") {
      throw new Error("Event closed or not found");
    }

    // ✅ Push full bid object
    const bidObj = {
      corporate,
      corporateName,
      offer,
      contactEmail,
      contactNumber,
      createdAt: new Date(),
    };

    event.bids.push(bidObj);

    await event.save();
    return event;
  },


  async getOpenEvents() {
    return await corporateEvent.find({ status: "open" });
  }
};

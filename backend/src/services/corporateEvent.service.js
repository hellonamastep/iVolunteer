import { Corporateevent } from '../models/Corporateevent.js';

class CorporateEventService {
  async createEvent(data) {
    const event = new Corporateevent(data);
    return await event.save();
  }

  async getAllEvents() {
    return await Corporateevent.find().sort({ date: 1 });
  }

  async getEventById(id) {
    return await Corporateevent.findById(id);
  }

  async updateEvent(id, data) {
    return await Corporateevent.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteEvent(id) {
    return await Corporateevent.findByIdAndDelete(id);
  }

  async getEventsByAdmin(adminId) {
    return await Corporateevent.find({ referenceId: adminId }).sort({ date: 1 });
  }

  
}

export const corporateEventService = new CorporateEventService();

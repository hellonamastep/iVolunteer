import { corporateEvent } from '../models/Corporateevent.js';

class CorporateEventService {
  async createEvent(data) {
    const event = new corporateEvent(data);
    await event.save();
    // Populate the ngoId before returning so notifications can access user data
    return await corporateEvent.findById(event._id).populate('ngoId', 'name email organizationName');
  }

  async getAllEvents() {
    return await corporateEvent.find()
      .populate('ngoId', 'name email organizationName city')
      .sort({ createdAt: -1 });
  }

  async getEventById(id) {
    return await corporateEvent.findById(id)
      .populate('ngoId', 'name email organizationName city contactNumber address');
  }

  async updateEvent(id, data) {
    return await corporateEvent.findByIdAndUpdate(id, data, { new: true })
      .populate('ngoId', 'name email organizationName city');
  }

  async deleteEvent(id) {
    return await corporateEvent.findByIdAndDelete(id);
  }

  async getEventsByAdmin(adminId) {
    return await corporateEvent.find({ referenceId: adminId }).sort({ createdAt: -1 });
  }

  async getEventsByNgo(ngoId) {
    return await corporateEvent.find({ ngoId: ngoId })
      .populate('ngoId', 'name email organizationName city')
      .sort({ createdAt: -1 });
  }

  async getPendingEvents() {
    return await corporateEvent.find({ status: 'pending' })
      .populate('ngoId', 'name email')
      .sort({ createdAt: -1 });
  }

  async getApprovedEvents() {
    return await corporateEvent.find({ status: 'approved' })
      .populate('ngoId', 'name email organizationName city contactNumber address')
      .sort({ createdAt: -1 });
  }
}

export const corporateEventService = new CorporateEventService();

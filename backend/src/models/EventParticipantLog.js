import mongoose from "mongoose";

const eventParticipantLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: {
        values: ["joined", "left", "removed"],
        message: "{VALUE} is not a valid action",
      },
      required: true,
    },
    participantData: {
      // Snapshot of participant data at the time of joining
      name: String,
      email: String,
      contactNumber: String,
      location: String,
      userType: String,
      points: Number,
    },
    performedBy: {
      // Who performed the action (for admin actions or self-actions)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      // Additional metadata like IP address, user agent, etc.
      ipAddress: String,
      userAgent: String,
      notes: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient querying
eventParticipantLogSchema.index({ eventId: 1, createdAt: -1 });
eventParticipantLogSchema.index({ participantId: 1, createdAt: -1 });
eventParticipantLogSchema.index({ eventId: 1, participantId: 1 });

// Virtual fields
eventParticipantLogSchema.virtual('event', {
  ref: 'Event',
  localField: 'eventId',
  foreignField: '_id',
  justOne: true
});

eventParticipantLogSchema.virtual('participant', {
  ref: 'User',
  localField: 'participantId',
  foreignField: '_id',
  justOne: true
});

// Static methods
eventParticipantLogSchema.statics.logJoin = async function (eventId, participant, performedBy = null) {
  return this.create({
    eventId,
    participantId: participant._id,
    action: 'joined',
    participantData: {
      name: participant.name,
      email: participant.email,
      contactNumber: participant.contactNumber,
      location: participant.location || participant.city,
      userType: participant.userType,
      points: participant.points || 0,
    },
    performedBy: performedBy || participant._id,
  });
};

eventParticipantLogSchema.statics.logLeave = async function (eventId, participantId, performedBy = null) {
  return this.create({
    eventId,
    participantId,
    action: 'left',
    performedBy: performedBy || participantId,
  });
};

eventParticipantLogSchema.statics.logRemoval = async function (eventId, participantId, performedBy, notes = null) {
  return this.create({
    eventId,
    participantId,
    action: 'removed',
    performedBy,
    metadata: {
      notes,
    },
  });
};

eventParticipantLogSchema.statics.getEventHistory = function (eventId) {
  return this.find({ eventId })
    .populate('participantId', 'name email')
    .populate('performedBy', 'name')
    .sort({ createdAt: -1 });
};

eventParticipantLogSchema.statics.getParticipantHistory = function (participantId) {
  return this.find({ participantId })
    .populate('eventId', 'title date location')
    .sort({ createdAt: -1 });
};

export const EventParticipantLog = mongoose.model('EventParticipantLog', eventParticipantLogSchema);

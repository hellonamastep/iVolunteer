import mongoose from "mongoose";

const participationRequestSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventCreatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      required: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Composite index to prevent duplicate requests - explicitly define the index name
participationRequestSchema.index(
  { eventId: 1, userId: 1 }, 
  { 
    unique: true, 
    name: "eventId_1_userId_1",
    background: true 
  }
);

// Virtual fields
participationRequestSchema.virtual('event', {
  ref: 'Event',
  localField: 'eventId',
  foreignField: '_id',
  justOne: true
});

participationRequestSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

participationRequestSchema.virtual('eventCreator', {
  ref: 'User',
  localField: 'eventCreatorId',
  foreignField: '_id',
  justOne: true
});

// Instance methods
participationRequestSchema.methods.accept = async function () {
  const Event = mongoose.model('Event');
  const event = await Event.findById(this.eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }

  if (event.participants.includes(this.userId)) {
    throw new Error('User is already a participant');
  }

  if (event.participants.length >= event.maxParticipants) {
    throw new Error('Event is full');
  }

  // Add user to event participants
  await Event.findByIdAndUpdate(
    this.eventId,
    { $addToSet: { participants: this.userId } }
  );

  this.status = 'accepted';
  await this.save();

  return this;
};

participationRequestSchema.methods.reject = async function (reason) {
  this.status = 'rejected';
  if (reason) {
    this.rejectionReason = reason;
  }
  await this.save();
  return this;
};

// Static methods
participationRequestSchema.statics.findByEventCreator = function (eventCreatorId, status = 'pending') {
  return this.find({ eventCreatorId, status })
    .populate('eventId', 'title date location maxParticipants')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
};

participationRequestSchema.statics.findByUser = function (userId, status = null) {
  const query = { userId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('eventId', 'title date location organization')
    .sort({ createdAt: -1 });
};

participationRequestSchema.statics.findByEvent = function (eventId, status = null) {
  const query = { eventId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
};

// Pre-save hook for validation
participationRequestSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Check if user is trying to request participation in their own event
    const Event = mongoose.model('Event');
    const event = await Event.findById(this.eventId);
    
    if (event && event.organizationId.toString() === this.userId.toString()) {
      return next(new Error('Event creators cannot request participation in their own events'));
    }

    // Check if user is already a participant
    if (event && event.participants.includes(this.userId)) {
      return next(new Error('User is already participating in this event'));
    }

    // Check if there's already a pending request
    const existingRequest = await this.constructor.findOne({
      eventId: this.eventId,
      userId: this.userId,
      status: 'pending'
    });

    if (existingRequest) {
      return next(new Error('A pending participation request already exists'));
    }
  }

  next();
});

export const ParticipationRequest = mongoose.model('ParticipationRequest', participationRequestSchema);
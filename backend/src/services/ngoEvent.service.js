import { Event } from "../models/Event.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const createEvent = async (data, organizationId, organizationName) => {
  const {
    title,
    description,
    location,
    detailedAddress,
    date,
    time,
    duration,
    category,
    maxParticipants,
    requirements = [],
    sponsorshipRequired,
    sponsorshipAmount,
    sponsorshipContactEmail,
    sponsorshipContactNumber,
    eventStatus,
    eventType = "community",
    image,
    images = [],
  } = data;

  const event = new Event({
    title,
    description,
    organization: organizationName,
    organizationId,
    location,
    detailedAddress,
    date,
    time,
    eventStatus,
    eventType,
    duration,
    category,
    maxParticipants,
    requirements,
    sponsorshipRequired,
    sponsorshipAmount,
    sponsorshipContactEmail,
    sponsorshipContactNumber,
    image,
    images,
    status: "pending",
  });

  try {
    return await event.save();
  } catch (error) {
    throw new ApiError(
      error.status || 500,
      error.message || "Failed to create event"
    );
  }
};

// Get all published events with participants populated and NGO details
// Optionally filtered by location (city-based filtering)
const getAllPublishedEvents = async (locationFilter = null) => {
  // Build the base query
  const baseQuery = { status: "approved" };
  
  // Add location filter if provided
  const query = locationFilter 
    ? { ...baseQuery, ...locationFilter }
    : baseQuery;

  console.log('Event query:', JSON.stringify(query, null, 2));

  // First, check for any events that still have the legacy participants field as number
  const eventsToMigrate = await Event.find({
    ...query,
    participants: { $type: "number" }
  });
  
  // Get all approved events with populated participants and NGO details
  const events = await Event.find(query)
    .populate('participants', '_id name email')
    .populate('organizationId', 'name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize')
    .sort({ date: 1 });
  
  console.log('Events found:', events.length);
  
  if (eventsToMigrate.length > 0) {
    console.log(
      `Auto-migrating ${eventsToMigrate.length} events with legacy participants`
    );
    for (const event of eventsToMigrate) {
      try {
        await Event.updateOne(
          { _id: event._id },
          { $set: { participants: [] } }
        );
        console.log(`Migrated event: ${event.title} (${event._id})`);
      } catch (error) {
        console.error(`Failed to migrate event ${event._id}:`, error);
      }
    }
    
    // Return fresh data after migration with populated participants and NGO details
    return await Event.find(query)
      .populate('participants', '_id name email')
      .populate('organizationId', 'name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize')
      .sort({ date: 1 });
  }
  
  return events;
};

// Get approved events that require sponsorship (use a real field)
const getSponsorshipEvents = async () => {
  return await Event.find({
    status: "approved",
    // sponsorshipRequired: true,
    sponsorshipAmount: { $gt: 0 },
  })
    .populate(
      "organizationId",
      "name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize"
    )
    .sort({ date: 1 });
};

const getEventsByOrganization = async (organizationId) => {
  console.log(
    `[SERVICE] Searching approved events for organizationId: ${organizationId}`
  );

  const events = await Event.find({
    organizationId,
    status: "approved",
    eventStatus: { $in: ["upcoming", "ongoing"] },
  })
    .populate("organizationId", "name email organizationType")
    .populate("participants", "_id name email")
    .sort({ date: 1 }); // soonest first

  console.log(`[SERVICE] Query result: ${events.length} events found`);
  return events;
};

export default {
  getEventsByOrganization,
};

const getUpcomingEvents = async () => {
  return await Event.find({
    status: "approved",
    date: { $gt: new Date() },
  })
    .populate(
      "organizationId",
      "name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize"
    )
    .sort({ date: 1 });
};

// Get single event by ID
const getEventById = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate("participants", "_id name email")
    .populate(
      "organizationId",
      "name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize"
    );

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
};

// Update status (approve/reject)
const updateEventStatus = async (eventId, status, rejectionReason = null) => {
  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  // Prepare update data
  const updateData = { status };
  
  // If rejecting, include rejection reason (if provided)
  if (status === "rejected" && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }
  
  // If approving, clear any previous rejection reason
  if (status === "approved") {
    updateData.rejectionReason = null;
  }

  const event = await Event.findByIdAndUpdate(
    eventId,
    updateData,
    { new: true }
  );

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return event;
};

// Get all pending events (for admin)
const getPendingEvents = async () => {
  return await Event.find({ status: "pending" }).sort({ createdAt: -1 });
};

// Participate in an event
const participateInEvent = async (eventId, userId) => {
  try {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is the event creator
    if (event.organizationId.toString() === userId.toString()) {
      throw new Error("Event creators cannot participate in their own events");
    }

    if (event.status !== "approved") {
      throw new Error("Event is not available for participation");
    }

    if (event.date <= new Date()) {
      throw new Error("Event has already started or ended");
    }

    // Auto-migrate legacy data: convert participants from number to array if needed
    let needsRefresh = false;
    if (typeof event.participants === "number") {
      console.log(
        `Auto-migrating event ${eventId}: converting participants from number to array`
      );
      await Event.updateOne({ _id: eventId }, { $set: { participants: [] } });
      needsRefresh = true;
    }

    // Initialize participants array if it doesn't exist or isn't an array
    if (!event.participants || !Array.isArray(event.participants)) {
      await Event.updateOne({ _id: eventId }, { $set: { participants: [] } });
      needsRefresh = true;
    }

    // Reload the event if we made changes
    const currentEvent = needsRefresh ? await Event.findById(eventId) : event;

    if (currentEvent.participants.includes(userId)) {
      throw new Error("You are already participating in this event");
    }

    if (currentEvent.participants.length >= currentEvent.maxParticipants) {
      throw new Error("Event is full");
    }

    // Add user to participants using $addToSet to avoid duplicates
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { participants: userId } },
      { new: true }
    );

    // Award participation points to user
    const User = (await import("../models/User.js")).User;
    const { ParticipationReward } = await import(
      "../controllers/rewards.controller.js"
    );

    const user = await User.findById(userId);
    if (user) {
      // No coins awarded for participation - just return the updated event with NGO details
      return {
        event: await Event.findById(eventId)
          .populate("participants", "name email")
          .populate(
            "organizationId",
            "name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize"
          ),
        pointsEarned: 0,
      };
    }

    return {
      event: await Event.findById(eventId)
        .populate("participants", "name email")
        .populate(
          "organizationId",
          "name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize"
        ),
      pointsEarned: 0,
    };
  } catch (error) {
    console.error("Error in participateInEvent:", error);
    throw error;
  }
};

// Leave an event
const leaveEvent = async (eventId, userId) => {
  try {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    // Auto-migrate legacy data: convert participants from number to array if needed
    let needsRefresh = false;
    if (typeof event.participants === "number") {
      console.log(
        `Auto-migrating event ${eventId}: converting participants from number to array`
      );
      await Event.updateOne({ _id: eventId }, { $set: { participants: [] } });
      needsRefresh = true;
    }

    // Initialize participants array if it doesn't exist or isn't an array
    if (!event.participants || !Array.isArray(event.participants)) {
      await Event.updateOne({ _id: eventId }, { $set: { participants: [] } });
      needsRefresh = true;
    }

    // Reload the event if we made changes
    const currentEvent = needsRefresh ? await Event.findById(eventId) : event;

    if (!currentEvent.participants.includes(userId)) {
      throw new Error("You are not participating in this event");
    }

    if (currentEvent.date <= new Date()) {
      throw new Error("Cannot leave an event that has already started");
    }

    // Remove user from participants using $pull
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { participants: userId } },
      { new: true }
    );

    return {
      event: await Event.findById(eventId)
        .populate("participants", "name email")
        .populate(
          "organizationId",
          "name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize"
        ),
    };
  } catch (error) {
    console.error("Error in leaveEvent:", error);
    throw error;
  }
};

// Get user's participated events
const getUserParticipatedEvents = async (userId) => {
  return await Event.find({
    participants: userId,
  })
    .populate(
      "organizationId",
      "name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize"
    )
    .sort({ date: -1 });
};

const requestEventCompletion = async (eventId, organizationId, proofImage) => {
  const event = await Event.findById(eventId);

  if (!event) throw new ApiError(404, "Event not found");
  if (event.organizationId.toString() !== organizationId.toString()) {
    throw new ApiError(403, "Only event creator can request completion");
  }
  if (event.completionStatus === "pending") {
    throw new ApiError(400, "Completion request already submitted");
  }

  // Only save proof and mark as pending
  event.completionProof = proofImage; // { url, caption }
  event.completionStatus = "pending"; // pending admin approval

  await event.save();
  return event;
};

// ngoEvent.service.js
// const getAllCompletionRequests = async () => {
//   return await Event.find({
//     completionStatus: "pending", // ✅ correct condition
//   })
//     .populate("organizationId", "name email")
//     .populate("participants", "_id name email")
//     .sort({ updatedAt: -1 });
// };

export const getAllCompletionRequests = async () => {
  try {
    const requests = await Event.find({ completionStatus: "pending" })
      .populate("organizationId", "name email")
      .populate("participants", "_id name email")
      .sort({ updatedAt: -1 })
      .lean();

    return requests;
  } catch (err) {
    console.error("Error fetching completion requests:", err);
    throw new ApiError(500, "Failed to fetch completion requests");
  }
};

// ✅ Approve or reject a specific completion request
export const reviewEventCompletion = async (eventId, decision) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid eventId");
  }

  const event = await Event.findById(eventId).populate("participants");
  if (!event) throw new ApiError(404, "Event not found");

  if (event.completionStatus !== "pending") {
    throw new ApiError(400, "No pending completion request for this event");
  }

  if (decision === "accepted") {
    event.completionStatus = "accepted";
    event.eventStatus = "completed";

    const totalPoints = event.scoringRule?.totalPoints || 0;

    for (const participant of event.participants) {
      const user = await mongoose.model("User").findById(participant._id);
      if (user) {
        user.points += totalPoints;
        await user.save();
      }
    }
  } else if (decision === "rejected") {
    event.completionStatus = "rejected";
    event.eventStatus = "ongoing";
  } else {
    throw new ApiError(400, "Invalid decision value");
  }

  await event.save();
  return event;
};



// const reviewEventCompletion = async (eventId, decision) => {
//   const event = await Event.findById(eventId).populate("participants");
//   if (!event) throw new ApiError(404, "Event not found");

//   if (event.completionStatus !== "pending") {
//     throw new ApiError(400, "No pending completion request for this event");
//   }

//   if (decision === "accepted") {
//     event.completionStatus = "accepted"; // admin approved
//     event.eventStatus = "completed"; // lifecycle field

//      const totalPoints = event.scoringRule?.totalPoints || 0;

//     // Award points to participants
//    for (const userId of event.participants) {
//     const user = await mongoose.model("User").findById(userId);
//     if (user) {
//       user.points += totalPoints;
//       await user.save();
//     }
//   }
//   } else if (decision === "rejected") {
//     event.completionStatus = "rejected"; // admin rejected
//     event.eventStatus = "ongoing"; // back to ongoing
//   } else {
//     throw new ApiError(400, "Invalid decision value");
//   }

//   await event.save();
//   return event;
// };

// Get all completion requests (approved/rejected) history (admin)
const getCompletionRequestHistory = async (ngoId) => {
  const filter = {
    completionStatus: { $in: ["accepted", "rejected"] }, // admin decisions
  };

  if (ngoId) {
    filter.organizationId = ngoId; // filter by NGO if provided
  }

  const events = await Event.find(filter)
    .populate("participants", "_id name email")
    .populate("organizationId", "name email organizationType")
    .sort({ updatedAt: -1 }); // latest decisions first

  return events;
};

// Get completed events of a specific NGO
const getCompletedEventsByNgo = async (ngoId) => {
  const events = await Event.find({
    organizationId: ngoId,
    eventStatus: "completed", // completed lifecycle
  })
    .populate("participants", "_id name email")
    .populate("organizationId", "name email organizationType")
    .sort({ date: -1 }); // latest completed first

  return events;
};

const approveEventWithScoring = async (
  eventId,
  baseCategoryOrPoints, // either category key (preferred) or numeric basePoints
  difficultyKeyOrMultiplier,
  hoursWorked // number
) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");

  // Base Event Points mapping (A)
  const basePointsMap = {
    small: 50,
    medium: 100,
    highImpact: 150,
    longTerm: 200,
  };

  // Difficulty multiplier mapping (B)
  const difficultyMap = {
    easy: 1.0,
    moderate: 1.3,
    challenging: 1.7,
    extreme: 2.0,
  };

  // Determine basePoints (accept numeric or category key)
  let basePoints = typeof baseCategoryOrPoints === "number"
    ? baseCategoryOrPoints
    : basePointsMap[baseCategoryOrPoints] ?? 50;

  // Determine difficulty multiplier (accept numeric or key)
  const difficultyMultiplier = typeof difficultyKeyOrMultiplier === "number"
    ? difficultyKeyOrMultiplier
    : difficultyMap[difficultyKeyOrMultiplier] ?? 1.0;

  const hours = Number(hoursWorked) || 0;
  const durationFactor = 1 + hours / 10; // DF = 1 + hours/10

  const totalPoints = Math.round(basePoints * difficultyMultiplier * durationFactor);

  event.status = "approved";
  event.scoringRule = {
    baseCategoryOrPoints,
    difficulty: difficultyKeyOrMultiplier,
    hoursWorked: hours,
    totalPoints,
  };

  // Keep pointsOffered for compatibility with older code paths that used it
  event.pointsOffered = totalPoints;

  await event.save();
  return event;
};



export const ngoEventService = {
  createEvent,
  getEventsByOrganization,
  getUpcomingEvents,
  getAllPublishedEvents,

  getSponsorshipEvents,
  getEventById,
  participateInEvent,
  leaveEvent,
  getUserParticipatedEvents,
  getPendingEvents,
  updateEventStatus,

  requestEventCompletion,
  reviewEventCompletion,
  getAllCompletionRequests,

  getCompletionRequestHistory,
  getCompletedEventsByNgo,

  approveEventWithScoring,
};

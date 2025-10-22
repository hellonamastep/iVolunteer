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
  console.log('\n[SERVICE] getAllPublishedEvents called');
  console.log('[SERVICE] locationFilter:', JSON.stringify(locationFilter, null, 2));
  
  // Build the base query - only show approved events
  const baseQuery = { status: "approved" };
  
  // Add location filter if provided
  const query = locationFilter 
    ? { ...baseQuery, ...locationFilter }
    : baseQuery;

  console.log('[SERVICE] Final query:', JSON.stringify(query, null, 2));

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
  
  console.log('[SERVICE] Events found:', events.length);
  console.log('[SERVICE] Event details:', events.map(e => ({ 
    title: e.title, 
    status: e.status, 
    location: e.location,
    date: e.date 
  })));
  
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
    const migratedEvents = await Event.find(query)
      .populate('participants', '_id name email')
      .populate('organizationId', 'name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize')
      .sort({ date: 1 });
    
    return filterEventsForDisplay(migratedEvents);
  }
  
  console.log('[SERVICE] ====================================\n');
  
  return filterEventsForDisplay(events);
};

// Helper function to filter out events that should be hidden after completion request
const filterEventsForDisplay = (events) => {
  const now = new Date();
  const THIRTY_MINUTES_MS = 30 * 60 * 1000;
  
  
  console.log('[FILTER] Starting filterEventsForDisplay');
  console.log('[FILTER] Current time:', now);
  console.log('[FILTER] Time threshold (ms):', THIRTY_MINUTES_MS);
  
  return events.map(event => {
    // Check if event has completion request pending or accepted
    if (event.completionStatus === 'pending' || event.completionStatus === 'accepted') {
      const eventObj = event.toObject();
      eventObj.isEventOver = true; // Mark as event over
      
      console.log(`[FILTER] Event "${event.title}" has completionStatus: ${event.completionStatus}`);
      console.log(`[FILTER] completionRequestedAt:`, event.completionRequestedAt);
      
      // Check if 30 minutes have passed since completion request
      if (event.completionRequestedAt) {
        const completionTime = new Date(event.completionRequestedAt);
        const timeSinceCompletion = now - completionTime;
        
        console.log(`[FILTER] Completion time: ${completionTime}`);
        console.log(`[FILTER] Time since completion (ms): ${timeSinceCompletion}`);
        console.log(`[FILTER] Should hide? ${timeSinceCompletion >= THIRTY_MINUTES_MS}`);
        
        if (timeSinceCompletion >= THIRTY_MINUTES_MS) {
          eventObj.shouldHide = true; // Mark for frontend to hide
          console.log(`[FILTER] ✓ Event "${event.title}" marked as shouldHide: true`);
        } else {
          console.log(`[FILTER] Event "${event.title}" NOT hiding yet, ${THIRTY_MINUTES_MS - timeSinceCompletion}ms remaining`);
        }
      } else {
        // Fallback: If completionRequestedAt is missing (for events accepted before this field was added),
        // use updatedAt as an approximation
        console.log(`[FILTER] ⚠️ Event "${event.title}" has no completionRequestedAt timestamp!`);
        
        if (event.updatedAt) {
          const updateTime = new Date(event.updatedAt);
          const timeSinceUpdate = now - updateTime;
          
          console.log(`[FILTER] Using updatedAt as fallback: ${updateTime}`);
          console.log(`[FILTER] Time since update (ms): ${timeSinceUpdate}`);
          console.log(`[FILTER] Should hide? ${timeSinceUpdate >= THIRTY_MINUTES_MS}`);
          
          if (timeSinceUpdate >= THIRTY_MINUTES_MS) {
            eventObj.shouldHide = true;
            console.log(`[FILTER] ✓ Event "${event.title}" marked as shouldHide: true (using updatedAt fallback)`);
          } else {
            console.log(`[FILTER] Event "${event.title}" NOT hiding yet (fallback), ${THIRTY_MINUTES_MS - timeSinceUpdate}ms remaining`);
          }
        } else {
          console.log(`[FILTER] ⚠️ Event "${event.title}" has no updatedAt either, hiding immediately`);
          eventObj.shouldHide = true; // Hide immediately if no timestamp available
        }
      }
      
      return eventObj;
    }
    return event;
  });
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
    `[SERVICE] Fetching ALL events for organizationId: ${organizationId}`
  );

  // Fetch ALL events for this organization (pending, approved, rejected)
  // NGO needs to see all their events with status banners
  const events = await Event.find({
    organizationId,
  })
    .populate("organizationId", "name email organizationType")
    .populate("participants", "_id name email")
    .sort({ createdAt: -1 }); // newest first

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
  event.completionRequestedAt = new Date(); // Track when completion was requested

  await event.save();
  return event;
};

// ngoEvent.service.js
const getAllCompletionRequests = async () => {
  return await Event.find({
    completionStatus: "pending", // ✅ correct condition
  })
    .populate("organizationId", "name email")
    .populate("participants", "_id name email")
    .sort({ updatedAt: -1 });
};

const reviewEventCompletion = async (eventId, decision) => {
  const event = await Event.findById(eventId).populate("participants");
  if (!event) throw new ApiError(404, "Event not found");

  if (event.completionStatus !== "pending") {
    throw new ApiError(400, "No pending completion request for this event");
  }

  if (decision === "accepted") {
    event.completionStatus = "accepted"; // admin approved
    event.eventStatus = "completed"; // lifecycle field

     const totalPoints = event.scoringRule?.totalPoints || 0;

    // Award points to participants
   for (const userId of event.participants) {
    const user = await mongoose.model("User").findById(userId);
    if (user) {
      user.points += totalPoints;
      await user.save();
    }
  }
  } else if (decision === "rejected") {
    event.completionStatus = "rejected"; // admin rejected
    event.eventStatus = "ongoing"; // back to ongoing
  } else {
    throw new ApiError(400, "Invalid decision value");
  }

  await event.save();
  return event;
};

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

// Get archived events for an organization (events that should be hidden from main list)
const getArchivedEvents = async (organizationId) => {
  const now = new Date();
  const THIRTY_MINUTES_MS = 30 * 60 * 1000;

  // Find events that are completed/accepted and past the 30-minute threshold
  const events = await Event.find({
    organizationId,
    status: "approved",
    $or: [
      { completionStatus: "pending" },
      { completionStatus: "accepted" }
    ]
  })
    .populate("organizationId", "name email organizationType")
    .populate("participants", "_id name email")
    .sort({ completionRequestedAt: -1, updatedAt: -1 });

  // Filter events that should be archived (30+ minutes since completion request)
  const archivedEvents = events.filter(event => {
    if (event.completionRequestedAt) {
      const timeSinceCompletion = now - new Date(event.completionRequestedAt);
      return timeSinceCompletion >= THIRTY_MINUTES_MS;
    } else if (event.updatedAt) {
      // Fallback to updatedAt for events without completionRequestedAt
      const timeSinceUpdate = now - new Date(event.updatedAt);
      return timeSinceUpdate >= THIRTY_MINUTES_MS;
    }
    return true; // Archive events with no timestamp
  });

  return archivedEvents;
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
  getArchivedEvents,
};

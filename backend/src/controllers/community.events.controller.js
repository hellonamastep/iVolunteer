import { Event } from '../models/Event.js';
import { Community } from '../models/Community.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a new event within a community
export const createEvent = asyncHandler(async (req, res) => {
    const { communityId } = req.params;
    const eventData = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
        throw new ApiError(404, 'Community not found');
    }

    // Check if user is community member
    if (!community.isMember(req.user._id)) {
        throw new ApiError(403, 'Only community members can create events');
    }

    // Create event
    const event = await Event.create({
        ...eventData,
        organizationId: community.owner,
        organization: community.name
    });

    // Add event to community
    community.events.push(event._id);
    await community.save();

    return res.status(201).json(
        new ApiResponse(201, event, 'Event created successfully')
    );
});

// Get all events in a community
export const getCommunityEvents = asyncHandler(async (req, res) => {
    const { communityId } = req.params;
    const { 
        status,
        category,
        search,
        page = 1,
        limit = 10,
        sort = '-date'
    } = req.query;

    const community = await Community.findById(communityId);
    if (!community) {
        throw new ApiError(404, 'Community not found');
    }

    const query = { _id: { $in: community.events } };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
        query.$or = [
            { title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') }
        ];
    }

    const events = await Event.find(query)
        .populate('participants', '_id name email')
        .populate('organizationId', 'name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            events,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        }, 'Events fetched successfully')
    );
});

// Get a single event by ID
export const getEvent = asyncHandler(async (req, res) => {
    const { communityId, eventId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
        throw new ApiError(404, 'Community not found');
    }

    const event = await Event.findOne({
        _id: eventId,
        _id: { $in: community.events }
    })
    .populate('participants', '_id name email')
    .populate('organizationId', 'name email organizationType websiteUrl yearEstablished contactNumber address ngoDescription focusAreas organizationSize');

    if (!event) {
        throw new ApiError(404, 'Event not found in this community');
    }

    return res.status(200).json(
        new ApiResponse(200, event, 'Event fetched successfully')
    );
});

// Update an event
export const updateEvent = asyncHandler(async (req, res) => {
    const { communityId, eventId } = req.params;
    const updates = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
        throw new ApiError(404, 'Community not found');
    }

    const event = await Event.findOne({
        _id: eventId,
        _id: { $in: community.events }
    });

    if (!event) {
        throw new ApiError(404, 'Event not found in this community');
    }

    // Check if user has permission (community admin or event creator)
    const userRole = community.getMemberRole(req.user._id);
    if (userRole !== 'admin' && event.organizationId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You do not have permission to update this event');
    }

    // Prevent updating critical fields
    delete updates.organizationId;
    delete updates.organization;

    const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $set: updates },
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedEvent, 'Event updated successfully')
    );
});

// Delete an event
export const deleteEvent = asyncHandler(async (req, res) => {
    const { communityId, eventId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
        throw new ApiError(404, 'Community not found');
    }

    const event = await Event.findOne({
        _id: eventId,
        _id: { $in: community.events }
    });

    if (!event) {
        throw new ApiError(404, 'Event not found in this community');
    }

    // Check if user has permission (community admin or event creator)
    const userRole = community.getMemberRole(req.user._id);
    if (userRole !== 'admin' && event.organizationId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You do not have permission to delete this event');
    }

    // Remove event from community
    community.events = community.events.filter(e => e.toString() !== eventId);
    await community.save();

    // Delete event
    await event.remove();

    return res.status(200).json(
        new ApiResponse(200, null, 'Event deleted successfully')
    );
});
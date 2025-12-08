// controllers/certificate.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { Event } from "../models/Event.js";

/**
 * Get all certificates for the authenticated volunteer
 * @route GET /api/v1/auth/certificates
 * @access Private (Volunteer only)
 */
export const getVolunteerCertificates = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find the user and populate completed events
  const user = await User.findById(userId)
    .populate({
      path: "completedEvents.eventId",
      select: "title eventDate organizationName createdBy",
      populate: {
        path: "createdBy",
        select: "fullName organizationName",
      },
    })
    .lean();

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Filter and transform completed events into certificates
  const certificates = (user.completedEvents || [])
    .filter((item) => item.eventId) // Only include events that still exist
    .map((item) => {
      const event = item.eventId;
      const admin = event.createdBy;

      return {
        _id: `${userId}_${event._id}`, // Unique certificate ID
        eventTitle: event.title || "Volunteer Event",
        eventDate: event.eventDate || new Date(),
        organizationName: admin?.organizationName || admin?.fullName || "Organization",
        volunteerName: user.fullName || "Volunteer",
        adminName: admin?.fullName || "Admin",
        completedAt: item.completedAt || new Date(),
        pointsEarned: item.pointsEarned || 0,
      };
    });

  // Return 200 with empty array if no certificates (not 404)
  return res.status(200).json({
    success: true,
    certificates,
    total: certificates.length,
  });
});

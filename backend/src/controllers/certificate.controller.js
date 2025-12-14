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
      path: "completedEvents",
      select: "title date organization organizationId scoringRule pointsOffered completionApprovedAt",
      populate: {
        path: "organizationId",
        select: "fullName organizationName name",
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
    .filter((event) => event && event._id) // Only include events that still exist
    .map((event) => {
      const admin = event.organizationId;
      const pointsEarned = event.scoringRule?.totalPoints || event.pointsOffered || 0;

      return {
        _id: `${userId}_${event._id}`, // Unique certificate ID
        eventId: event._id,
        eventTitle: event.title || "Volunteer Event",
        eventDate: event.date || new Date(),
        organizationName: event.organization || admin?.organizationName || admin?.name || admin?.fullName || "Organization",
        volunteerName: user.fullName || user.name || "Volunteer",
        adminName: admin?.fullName || admin?.name || "Admin",
        completedAt: event.completionApprovedAt || new Date(),
        pointsEarned: pointsEarned,
      };
    });

  // Return 200 with empty array if no certificates (not 404)
  return res.status(200).json({
    success: true,
    certificates,
    total: certificates.length,
  });
});

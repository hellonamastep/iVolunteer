import { User } from "../models/User.js";
import { addPoints } from "../services/pointsBadge.service.js";

const earnPoints = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const actionType = req.body.actionType;
    const referenceId = req.body.referenceId || null;

    if (!actionType) {
      return res.status(400).json({ success: false, message: "actionType is required" });
    }

    // Call service to add points and unlock level-based badges
    const result = await addPoints(req.user._id, actionType, referenceId);

    res.json({
      success: true,
      totalPoints: result.totalPoints,
      currentLevel: result.currentLevel,
      newBadges: result.newBadges,
      allBadges: result.allBadges,
    });
  } catch (err) {
    console.error("❌ earnPoints error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};


const getMyPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("points badges");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({
      success: true,
      points: user.points || 0,
      badges: user.badges || [],
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const pointsBadgesController = {
  earnPoints,
  getMyPoints,
};

import { User } from "../models/User.js";
import { pointsRules,badgeRules } from "./pointsBadgeRules.js";

export const addPoints = async (userId, actionType = null, referenceId = null) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Only add points if actionType exists
  if (actionType) {
    const rule = pointsRules.find(r => r.type === actionType);
    if (!rule) throw new Error("No points rule found for this action");

    // Prevent duplicate rewards
    if (referenceId) {
      const alreadyRewarded = user.pointsHistory?.some(
        h => h.type === actionType && h.referenceId === referenceId
      );
      if (alreadyRewarded) throw new Error("Points already awarded for this action");
    }

    const pointsToAdd = rule.points || 100; // default points
    user.points = (user.points || 0) + pointsToAdd;
    if (!user.pointsHistory) user.pointsHistory = [];
    user.pointsHistory.push({ type: actionType, points: pointsToAdd, referenceId });
  }

  // Calculate level
  const pointsPerLevel = 500;
  const currentLevel = Math.floor((user.points || 0) / pointsPerLevel) + 1;

  // Unlock badges by level
  const unlockedBadges = [];
  badgeRules.forEach(badge => {
    const alreadyUnlocked = user.badges?.some(b => b.badgeId === badge.id);
    if (!alreadyUnlocked && currentLevel >= badge.unlockLevel) {
      const newBadge = {
        badgeId: badge.id,
        name: badge.name,
        tier: badge.tier,
        icon: badge.icon,
        unlockedAt: new Date(),
      };
      if (!user.badges) user.badges = [];
      user.badges.push(newBadge);
      unlockedBadges.push(newBadge);
    }
  });

  await user.save();

  return {
    totalPoints: user.points || 0,
    currentLevel,
    newBadges: unlockedBadges,
    allBadges: user.badges || [],
  };
};



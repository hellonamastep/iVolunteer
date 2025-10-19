export const pointsRules = [
  {
    id: "PTS001",
    type: "eventParticipation",
    points: 50,
    description: "Register",
  },
  {
    id: "PTS003",
    type: "everyDonation",
    points: 10,
    description: "every donation",
  },
  { id: "PTS004", type: "addPost", points: 5, description: "On every post" },
];

// services/pointsBadgeRules.js

export const badgeRules = [
  {
    id: "BDG001",
    name: "Rookie Hero",
    unlockLevel: 1,
    description: "Welcome to the journey! Reach Level 1",
    tier: "Common",
    icon: "🎉",
  },
  {
    id: "BDG002",
    name: "Rising Star",
    unlockLevel: 10,
    description: "Keep going! Reach Level 10",
    tier: "Rare",
    icon: "⭐",
  },
  {
    id: "BDG003",
    name: "Trailblazer",
    unlockLevel: 25,
    description: "You are unstoppable! Reach Level 25",
    tier: "Epic",
    icon: "🔥",
  },
  {
    id: "BDG004",
    name: "Legend in Making",
    unlockLevel: 50,
    description: "Halfway to greatness! Reach Level 50",
    tier: "Legendary",
    icon: "🏆",
  },
  {
    id: "BDG005",
    name: "Ultimate Champion",
    unlockLevel: 100,
    description: "You are a legend! Reach Level 100",
    tier: "Mythic",
    icon: "👑",
  },
];

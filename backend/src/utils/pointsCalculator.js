export const calculateImpactPoints = ({
  basePoints,
  difficulty,
  durationHours,
  verification,
  participants,
  attendance,
  isVirtualEvent = false,
}) => {
  const difficultyMultiplier = {
    easy: 1.0,
    moderate: 1.3,
    hard: 1.7,
    extreme: 2.0,
  };

  const verificationBonus = {
    auto: 30,
    manual: 20,
    none: 0,
  };

  const penalties = {
    no_show: -40,
    late_cancel: -15,
    spam: -100,
  };

  const participantBonus = (count) => {
    if (count < 10) return 10;
    if (count < 50) return 20;
    return 30;
  };

  const DM = difficultyMultiplier[difficulty] || 1;
  const DF = 1 + Math.min(durationHours, 10) / 10;
  const VB = verificationBonus[verification] || 0;
  const PB = participantBonus(participants);
  const penalty = penalties[attendance] || 0;

  let total = basePoints * DM * DF + VB + PB + penalty;
  if (isVirtualEvent) total *= 0.8;

  return Math.round(total);
};

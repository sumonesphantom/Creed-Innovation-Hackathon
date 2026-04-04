import { UserProfile, ReadinessScore } from "@/types";

export function calculateReadinessScore(
  profile: UserProfile,
  hasCompletedCrisisFlow: boolean = false,
  hasUsedBudget: boolean = false,
  hasVisitedBenefits: boolean = false
): ReadinessScore {
  // Savings (25 pts)
  let savings = 0;
  if (profile.canCover500 === "yes") savings = 25;
  else if (profile.canCover500 === "maybe") savings = 12;

  // Insurance (25 pts) — 5 pts per type, +5 bonus for 3+
  const insuranceCount = profile.insurance.length;
  let insurance = Math.min(insuranceCount * 5, 20);
  if (insuranceCount >= 3) insurance += 5;
  insurance = Math.min(insurance, 25);

  // Awareness (50 pts) — engagement with app tools
  let awareness = 0;
  if (hasCompletedCrisisFlow) awareness += 20;
  if (hasUsedBudget) awareness += 20;
  if (hasVisitedBenefits) awareness += 10;
  awareness = Math.min(awareness, 50);

  const score = savings + insurance + awareness;

  return {
    deviceId: profile.deviceId,
    score,
    breakdown: { savings, insurance, awareness },
    calculatedAt: new Date(),
  };
}

export function getScoreMessage(score: number): string {
  if (score <= 30) return "Let's build your safety net — here's where to start";
  if (score <= 50) return "You've got a foundation — let's strengthen it";
  if (score <= 70) return "You're getting prepared — a few more steps to go";
  if (score <= 90) return "Looking solid! Here's how to close the gaps";
  return "You're ready for almost anything!";
}

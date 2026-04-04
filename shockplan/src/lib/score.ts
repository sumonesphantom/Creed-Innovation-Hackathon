import { UserProfile, ReadinessScore } from "@/types";

export function calculateReadinessScore(
  profile: UserProfile,
  documentCount: Record<string, number> = {},
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

  // Documents (25 pts) — 5 pts per category with at least one doc
  const docCategories = ["insurance", "id", "lease", "medical", "financial"];
  let documents = 0;
  for (const cat of docCategories) {
    if ((documentCount[cat] || 0) > 0) documents += 5;
  }
  documents = Math.min(documents, 25);

  // Awareness (25 pts)
  let awareness = 0;
  if (hasCompletedCrisisFlow) awareness += 10;
  if (hasUsedBudget) awareness += 10;
  if (hasVisitedBenefits) awareness += 5;
  awareness = Math.min(awareness, 25);

  const score = savings + insurance + documents + awareness;

  return {
    deviceId: profile.deviceId,
    score,
    breakdown: { savings, insurance, documents, awareness },
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

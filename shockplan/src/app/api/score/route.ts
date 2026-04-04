import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Profile, Score, VaultMetadata } from "@/lib/models";
import { calculateReadinessScore } from "@/lib/score";

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId");
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }

  await connectToDatabase();
  const score = await Score.findOne({ deviceId }).sort({ calculatedAt: -1 });

  if (!score) {
    return NextResponse.json({ error: "Score not found" }, { status: 404 });
  }

  return NextResponse.json(score);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { deviceId, hasCompletedCrisisFlow, hasUsedBudget, hasVisitedBenefits } = body;

  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }

  await connectToDatabase();

  const profile = await Profile.findOne({ deviceId });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Count documents by category
  const vaultDocs = await VaultMetadata.find({ deviceId });
  const documentCount: Record<string, number> = {};
  for (const doc of vaultDocs) {
    documentCount[doc.category] = (documentCount[doc.category] || 0) + 1;
  }

  const scoreData = calculateReadinessScore(
    profile.toObject(),
    documentCount,
    hasCompletedCrisisFlow || false,
    hasUsedBudget || false,
    hasVisitedBenefits || false
  );

  const score = await Score.findOneAndUpdate(
    { deviceId },
    scoreData,
    { upsert: true, new: true }
  );

  return NextResponse.json(score);
}

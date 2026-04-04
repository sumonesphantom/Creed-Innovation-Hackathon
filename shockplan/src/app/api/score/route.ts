import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Profile, Score, VaultMetadata } from "@/lib/models";
import { calculateReadinessScore } from "@/lib/score";
import { getUserIdentifier, buildUserQuery } from "@/lib/get-user";

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId") || "";
  const { userId, deviceId: resolvedDeviceId } = await getUserIdentifier(deviceId);

  const query = buildUserQuery(userId, resolvedDeviceId);
  if (!query) {
    return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
  }

  await connectToDatabase();
  const score = await Score.findOne(query).sort({ calculatedAt: -1 });

  if (!score) {
    return NextResponse.json({ error: "Score not found" }, { status: 404 });
  }

  return NextResponse.json(score);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { deviceId: bodyDeviceId, hasCompletedCrisisFlow, hasUsedBudget, hasVisitedBenefits } = body;
  const { userId, deviceId: resolvedDeviceId } = await getUserIdentifier(bodyDeviceId);

  const query = buildUserQuery(userId, resolvedDeviceId);
  if (!query) {
    return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
  }

  await connectToDatabase();

  const profile = await Profile.findOne(query);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const vaultDocs = await VaultMetadata.find(query);
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

  const upsertQuery = userId
    ? { userId }
    : { deviceId: resolvedDeviceId };

  const score = await Score.findOneAndUpdate(
    upsertQuery,
    { ...scoreData, userId, deviceId: resolvedDeviceId },
    { upsert: true, new: true }
  );

  return NextResponse.json(score);
}

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { FlowPlan, Profile, Score, VaultMetadata } from "@/lib/models";
import { getUserIdentifier, buildUserQuery } from "@/lib/get-user";

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId") || "";
  const { userId, deviceId: resolvedDeviceId } = await getUserIdentifier(deviceId);

  const query = buildUserQuery(userId, resolvedDeviceId);
  if (!query) {
    return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
  }

  await connectToDatabase();
  const profile = await Profile.findOne(query);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { deviceId: bodyDeviceId } = body;
  const { userId, deviceId: resolvedDeviceId, authenticated } = await getUserIdentifier(bodyDeviceId);

  if (!userId && !resolvedDeviceId) {
    return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
  }

  await connectToDatabase();

  // If authenticated, try to find existing profile by userId or migrate from deviceId
  if (authenticated && userId) {
    let profile = await Profile.findOne({ userId });

    if (!profile && resolvedDeviceId) {
      // Migrate anonymous profile to this user
      profile = await Profile.findOne({ deviceId: resolvedDeviceId, userId: { $in: ["", null] } });
      if (profile) {
        profile.userId = userId;
      }
    }

    if (profile) {
      // Update existing profile
      Object.assign(profile, { ...body, userId, updatedAt: new Date() });
      await profile.save();
      return NextResponse.json(profile);
    }

    // Create new profile for authenticated user
    const newProfile = await Profile.create({
      ...body,
      userId,
      deviceId: resolvedDeviceId,
      updatedAt: new Date(),
    });
    return NextResponse.json(newProfile);
  }

  // Anonymous: upsert by deviceId
  const profile = await Profile.findOneAndUpdate(
    { deviceId: resolvedDeviceId },
    { ...body, updatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json(profile);
}

export async function DELETE(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId") || "";
  const { userId, deviceId: resolvedDeviceId } = await getUserIdentifier(deviceId);

  const query = buildUserQuery(userId, resolvedDeviceId);
  if (!query) {
    return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
  }

  await connectToDatabase();
  await Profile.deleteOne(query);
  await Score.deleteMany(query);
  await VaultMetadata.deleteMany(query);
  await FlowPlan.deleteMany(query);

  return NextResponse.json({ success: true });
}

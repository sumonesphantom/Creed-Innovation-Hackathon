import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Profile } from "@/lib/models";

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId");
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }

  await connectToDatabase();
  const profile = await Profile.findOne({ deviceId });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { deviceId } = body;

  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }

  await connectToDatabase();

  const profile = await Profile.findOneAndUpdate(
    { deviceId },
    { ...body, updatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json(profile);
}

export async function DELETE(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId");
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }

  await connectToDatabase();
  await Profile.deleteOne({ deviceId });

  return NextResponse.json({ success: true });
}

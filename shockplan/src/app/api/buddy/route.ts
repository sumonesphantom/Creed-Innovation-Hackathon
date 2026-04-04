import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Profile, Score } from "@/lib/models";
import { chatWithBuddy } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { message, deviceId, crisisContext } = await request.json();

    if (!message || !deviceId) {
      return NextResponse.json(
        { error: "message and deviceId required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const profile = await Profile.findOne({ deviceId });
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Complete onboarding first." },
        { status: 404 }
      );
    }

    const score = await Score.findOne({ deviceId }).sort({ calculatedAt: -1 });

    const response = await chatWithBuddy(
      message,
      profile.toObject(),
      score?.toObject(),
      crisisContext
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Buddy chat error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

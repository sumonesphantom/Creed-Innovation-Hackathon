import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Profile, Score } from "@/lib/models";
import { chatWithBuddy } from "@/lib/gemini";
import { getUserIdentifier, buildUserQuery } from "@/lib/get-user";

export async function POST(request: NextRequest) {
  try {
    const { message, deviceId: bodyDeviceId, crisisContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const { userId, deviceId, name } = await getUserIdentifier(bodyDeviceId);
    const query = buildUserQuery(userId, deviceId);

    if (!query) {
      return NextResponse.json(
        { error: "Not authenticated and no deviceId. Complete onboarding first." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const profile = await Profile.findOne(query);
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Complete onboarding first." },
        { status: 404 }
      );
    }

    const score = await Score.findOne(query).sort({ calculatedAt: -1 });

    const response = await chatWithBuddy(
      message,
      { ...profile.toObject(), userName: name },
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

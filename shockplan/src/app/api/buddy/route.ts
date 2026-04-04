import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Profile, Score, BuddyChat } from "@/lib/models";
import {
  buddyStoredToGeminiHistory,
  createBuddyChatReadableStream,
} from "@/lib/gemini";
import { getUserIdentifier, buildUserQuery } from "@/lib/get-user";

async function resolveBuddyContext(request: NextRequest, bodyDeviceId?: string) {
  const { userId, deviceId, name } = await getUserIdentifier(bodyDeviceId);
  const query = buildUserQuery(userId, deviceId);
  return { userId, deviceId, name, query };
}

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId") || "";
    const { query } = await resolveBuddyContext(request, deviceId);
    if (!query) {
      return NextResponse.json({ messages: [] });
    }
    await connectToDatabase();
    const doc = await BuddyChat.findOne(query).lean();
    const messages = doc?.messages ?? [];
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Buddy history GET error:", error);
    return NextResponse.json({ messages: [] });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { deviceId: bodyDeviceId } = await request.json();
    const { query } = await resolveBuddyContext(request, bodyDeviceId);
    if (!query) {
      return NextResponse.json({ error: "Not authenticated and no deviceId." }, { status: 400 });
    }
    await connectToDatabase();
    await BuddyChat.findOneAndUpdate(query, {
      $set: { messages: [], updatedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Buddy history DELETE error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, deviceId: bodyDeviceId, crisisContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const { userId, deviceId, name, query } = await resolveBuddyContext(request, bodyDeviceId);

    if (!query) {
      return NextResponse.json(
        { error: "Not authenticated and no deviceId. Complete onboarding first." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let profile = await Profile.findOne(query);

    // If authenticated but no profile found by userId, try migrating from deviceId
    if (!profile && userId && deviceId) {
      profile = await Profile.findOneAndUpdate(
        { deviceId, userId: { $in: ["", null, undefined] } },
        { $set: { userId } },
        { new: true }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Complete onboarding first." },
        { status: 404 }
      );
    }

    const resolvedQuery = profile.userId ? { userId: profile.userId } : { deviceId: profile.deviceId };
    const score = await Score.findOne(resolvedQuery).sort({ calculatedAt: -1 });

    const chatDoc = await BuddyChat.findOne(resolvedQuery).lean();
    const prior = chatDoc?.messages ?? [];
    const history = buddyStoredToGeminiHistory(prior);

    const stream = createBuddyChatReadableStream(
      message,
      { ...profile.toObject(), userName: name },
      score?.toObject(),
      crisisContext,
      history,
      async (assistantText) => {
        const userMsgId = randomUUID();
        const buddyMsgId = randomUUID();
        await BuddyChat.findOneAndUpdate(
          resolvedQuery,
          {
            $push: {
              messages: {
                $each: [
                  { id: userMsgId, role: "user", content: message, createdAt: new Date() },
                  { id: buddyMsgId, role: "buddy", content: assistantText, createdAt: new Date() },
                ],
              },
            },
            $set: { updatedAt: new Date() },
            $setOnInsert: {
              userId: userId || "",
              deviceId: deviceId || "",
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Buddy chat error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

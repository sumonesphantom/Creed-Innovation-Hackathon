import { NextRequest, NextResponse } from "next/server";
import {
  clearBuddyMessages,
  getBuddyMessages,
  handleBuddyChatMessage,
} from "@/lib/buddy-chat-handler";

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId") || "";
  const result = await getBuddyMessages(request, deviceId);
  if (!result.ok) {
    return NextResponse.json({ messages: [] }, { status: result.status });
  }
  return NextResponse.json({ messages: result.messages });
}

export async function DELETE(request: NextRequest) {
  const { deviceId: bodyDeviceId } = await request.clone().json();
  const result = await clearBuddyMessages(request, bodyDeviceId);
  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const body = await request.clone().json();
  const result = await handleBuddyChatMessage(request, body);
  if (!result.ok) {
    return NextResponse.json(result.body, { status: result.status });
  }
  return new Response(result.stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

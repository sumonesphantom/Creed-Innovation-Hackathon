import { NextResponse } from "next/server";
import { createBuddyRoomKey } from "@/lib/buddy-room-registry";

export async function GET() {
  const roomKey = createBuddyRoomKey();
  return NextResponse.json({ roomKey });
}

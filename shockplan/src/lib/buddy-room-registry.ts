import { randomUUID } from "crypto";

const rooms = new Set<string>();

export function createBuddyRoomKey(): string {
  const key = randomUUID();
  rooms.add(key);
  return key;
}

export function validateBuddyRoomKey(key: string): boolean {
  return rooms.has(key);
}

export function revokeBuddyRoomKey(key: string): void {
  rooms.delete(key);
}

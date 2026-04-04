import { auth } from "./auth";
import { connectToDatabase } from "./mongodb";
import { User } from "./models";

/**
 * Gets the current user's identifier for DB queries.
 * Returns { userId, deviceId } — userId is set when authenticated,
 * deviceId is the fallback from the request body/params.
 */
export async function getUserIdentifier(requestDeviceId?: string) {
  const session = await auth();

  if (session?.user?.email) {
    await connectToDatabase();
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) {
      return {
        userId: dbUser._id.toString(),
        deviceId: requestDeviceId || dbUser.deviceId || "",
        name: dbUser.name || session.user.name || "",
        authenticated: true,
      };
    }
  }

  return {
    userId: "",
    deviceId: requestDeviceId || "",
    name: "",
    authenticated: false,
  };
}

/**
 * Builds a MongoDB query that finds docs by userId (if authenticated)
 * or deviceId (anonymous fallback).
 */
export function buildUserQuery(userId: string, deviceId: string) {
  if (userId) {
    return { userId };
  }
  if (deviceId) {
    return { deviceId };
  }
  return null;
}

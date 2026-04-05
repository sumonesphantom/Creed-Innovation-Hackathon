import type { NextRequest } from "next/server";
import { getAuth0Client } from "./auth0";
import { connectToDatabase } from "./mongodb";
import { User } from "./models";

/**
 * Gets the current user's identifier for DB queries.
 * Returns { userId, deviceId } — userId is set when authenticated,
 * deviceId is the fallback from the request body/params.
 */
export async function getUserIdentifier(requestDeviceId?: string, request?: Request) {
  const auth0 = await getAuth0Client();
  const session = request
    ? await auth0.getSession(request as NextRequest)
    : await auth0.getSession();

  if (session?.user?.email) {
    await connectToDatabase();
    let dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      await User.findOneAndUpdate(
        { email: session.user.email },
        {
          email: session.user.email,
          name: session.user.name,
          image: session.user.picture ?? "",
          provider: "auth0",
          providerId: session.user.sub ?? "",
          lastLoginAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      dbUser = await User.findOne({ email: session.user.email });
    }
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

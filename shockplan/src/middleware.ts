import type { NextRequest } from "next/server";

import { getAuth0Client } from "@/lib/auth0";

export async function middleware(request: NextRequest) {
  const auth0 = await getAuth0Client();
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

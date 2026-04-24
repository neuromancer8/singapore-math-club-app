import { NextResponse } from "next/server";
import { authCookie, clearAuthCookie } from "@/lib/server/auth-cookie";
import { getCurrentSession } from "@/lib/server/current-session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const refresh = new URL(request.url).searchParams.get("refresh") !== "false";
  const current = await getCurrentSession({ refresh });

  if (!current) {
    const response = NextResponse.json({ session: null, profiles: [], progress: null }, { status: 401 });
    response.cookies.set(clearAuthCookie());
    return response;
  }

  const response = NextResponse.json(current);
  if (refresh) {
    response.cookies.set(authCookie(current.sessionId));
  }

  return response;
}

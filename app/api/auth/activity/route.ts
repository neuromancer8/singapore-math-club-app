import { NextResponse } from "next/server";
import { authCookie, clearAuthCookie } from "@/lib/server/auth-cookie";
import { getCurrentSession } from "@/lib/server/current-session";

export const runtime = "nodejs";

export async function POST() {
  const current = await getCurrentSession({ refresh: true });

  if (!current) {
    const response = NextResponse.json({ success: false }, { status: 401 });
    response.cookies.set(clearAuthCookie());
    return response;
  }

  const response = NextResponse.json({ success: true, session: current.session });
  response.cookies.set(authCookie(current.sessionId));
  return response;
}

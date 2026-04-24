import { NextResponse } from "next/server";
import { authCookie } from "@/lib/server/auth-cookie";
import { getCurrentSession } from "@/lib/server/current-session";
import { switchActiveLearner } from "@/lib/server/auth-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const current = await getCurrentSession({ refresh: false });
  if (!current) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { learnerId?: string } | null;
  if (!body?.learnerId?.trim()) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const next = await switchActiveLearner(current.sessionId, body.learnerId);
  if (!next?.session) {
    return NextResponse.json({ success: false }, { status: 404 });
  }

  const response = NextResponse.json({ success: true, session: next.session, profiles: next.profiles, progress: next.progress });
  response.cookies.set(authCookie(current.sessionId));
  return response;
}

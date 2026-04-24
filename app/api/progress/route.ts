import { NextResponse } from "next/server";
import { normalizeProgress } from "@/lib/progress";
import { authCookie } from "@/lib/server/auth-cookie";
import { getCurrentSession } from "@/lib/server/current-session";
import { saveProgressForLearner } from "@/lib/server/auth-store";
import type { SavedProgress } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const current = await getCurrentSession({ refresh: false });
  if (!current) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  return NextResponse.json({ success: true, progress: current.progress });
}

export async function POST(request: Request) {
  const current = await getCurrentSession({ refresh: true });
  if (!current?.session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { progress?: SavedProgress } | null;
  const progress = normalizeProgress(body?.progress);
  const saved = await saveProgressForLearner(current.session.activeLearnerId, progress);

  const response = NextResponse.json({ success: true, progress: saved });
  response.cookies.set(authCookie(current.sessionId));

  return response;
}

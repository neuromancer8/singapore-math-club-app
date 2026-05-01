import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/server/current-session";
import { listLearnerProgressSummaries } from "@/lib/server/auth-store";

export const runtime = "nodejs";

export async function GET() {
  const current = await getCurrentSession({ refresh: false });
  if (!current?.session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const learners = await listLearnerProgressSummaries(current.session);
  return NextResponse.json({
    success: true,
    scope: current.session.role === "teacher" || current.session.role === "admin" ? "class" : "family",
    learners,
  });
}

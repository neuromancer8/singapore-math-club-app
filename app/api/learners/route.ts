import { NextResponse } from "next/server";
import { isAvatarId } from "@/lib/avatars";
import { authCookie } from "@/lib/server/auth-cookie";
import { getCurrentSession } from "@/lib/server/current-session";
import { createLearnerProfile, readSession } from "@/lib/server/auth-store";
import type { Grade } from "@/lib/types";

export const runtime = "nodejs";

function isGrade(value: string): value is Grade {
  return value === "seconda" || value === "terza" || value === "quarta";
}

export async function POST(request: Request) {
  const current = await getCurrentSession({ refresh: true });
  if (!current?.session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    firstName?: string;
    lastName?: string;
    learnerGrade?: string;
    avatarId?: string;
  } | null;

  const learnerGrade = body?.learnerGrade;

  if (!body?.firstName?.trim() || !body.lastName?.trim() || !isGrade(learnerGrade ?? "") || !isAvatarId(body.avatarId)) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const nextGrade = learnerGrade as Grade;

  await createLearnerProfile(current.session.userId, {
    firstName: body.firstName,
    lastName: body.lastName?.trim() ?? "",
    learnerGrade: nextGrade,
    avatarId: body.avatarId,
  });

  const next = await readSession(current.sessionId, { refresh: false });
  if (!next) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const response = NextResponse.json({ success: true, session: next.session, profiles: next.profiles, progress: next.progress });
  response.cookies.set(authCookie(current.sessionId));
  return response;
}

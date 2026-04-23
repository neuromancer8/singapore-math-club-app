import { NextResponse } from "next/server";
import { isAvatarId } from "@/lib/avatars";
import { authCookie } from "@/lib/server/auth-cookie";
import { getCurrentSession } from "@/lib/server/current-session";
import { updateAvatar } from "@/lib/server/auth-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const current = await getCurrentSession({ refresh: true });
  if (!current) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { avatarId?: string } | null;
  if (!isAvatarId(body?.avatarId)) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  await updateAvatar(current.session.userId, body.avatarId);

  const response = NextResponse.json({
    success: true,
    session: {
      ...current.session,
      avatarId: body.avatarId,
    },
  });
  response.cookies.set(authCookie(current.sessionId));

  return response;
}

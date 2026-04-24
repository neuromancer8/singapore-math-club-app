import { NextResponse } from "next/server";
import { authCookie } from "@/lib/server/auth-cookie";
import { ensureAuthStore, loginWithCredentials } from "@/lib/server/auth-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureAuthStore();
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;

  const result = await loginWithCredentials(body?.email ?? "", body?.password ?? "");
  if (!result.success) {
    return NextResponse.json({ success: false, reason: result.reason, email: result.email }, { status: 401 });
  }

  const response = NextResponse.json({
    success: true,
    session: result.session,
    profiles: result.profiles,
    progress: result.progress,
  });
  response.cookies.set(authCookie(result.sessionId));

  return response;
}

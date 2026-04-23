import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, clearAuthCookie } from "@/lib/server/auth-cookie";
import { logoutSession } from "@/lib/server/auth-store";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? "";

  await logoutSession(sessionId);

  const response = NextResponse.json({ success: true });
  response.cookies.set(clearAuthCookie());

  return response;
}

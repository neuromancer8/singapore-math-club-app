import { NextResponse } from "next/server";
import { authCookie } from "@/lib/server/auth-cookie";
import { ensureAuthStore, registerParent } from "@/lib/server/auth-store";
import type { ParentRegistrationInput } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureAuthStore();
  const body = (await request.json().catch(() => null)) as ParentRegistrationInput | null;

  const result = await registerParent(
    body ?? {
      parentFirstName: "",
      parentLastName: "",
      username: "",
      password: "",
      childFirstName: "",
      childLastName: "",
      childGrade: "seconda",
      childAvatarId: "rocket",
    },
  );

  if (!result.success) {
    return NextResponse.json({ success: false, reason: result.reason }, { status: result.reason === "exists" ? 409 : 400 });
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

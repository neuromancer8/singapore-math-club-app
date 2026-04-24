import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/server/auth-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string; password?: string } | null;
  const result = await resetPassword(body?.token ?? "", body?.password ?? "");

  if (!result.success) {
    return NextResponse.json({ success: false, reason: result.reason }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

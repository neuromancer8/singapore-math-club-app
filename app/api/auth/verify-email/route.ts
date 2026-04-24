import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/server/auth-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const result = await verifyEmailToken(body?.token ?? "");

  if (!result.success) {
    return NextResponse.json({ success: false, reason: result.reason }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

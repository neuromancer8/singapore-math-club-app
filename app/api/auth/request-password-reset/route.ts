import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/server/auth-store";
import { buildPasswordResetUrl, sendTransactionalEmail } from "@/lib/server/mailer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const result = await requestPasswordReset(body?.email ?? "");

  if (!result.success) {
    if (result.reason === "invalid") {
      return NextResponse.json({ success: false, reason: result.reason }, { status: 400 });
    }

    return NextResponse.json({ success: true, delivered: true });
  }

  const origin = new URL(request.url).origin;
  const resetUrl = buildPasswordResetUrl(origin, result.resetToken);
  const emailResult = await sendTransactionalEmail(
    {
      to: result.email,
      subject: "Reimposta la tua password",
      text: `Apri questo link per reimpostare la password: ${resetUrl}`,
      html: `<p>Hai richiesto il recupero password.</p><p>Apri questo link per impostarne una nuova:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    },
    resetUrl,
  );

  return NextResponse.json({
    success: true,
    previewUrl: emailResult.previewUrl,
    delivered: emailResult.delivered,
  });
}

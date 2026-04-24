import { NextResponse } from "next/server";
import { requestEmailVerification } from "@/lib/server/auth-store";
import { buildVerificationUrl, sendTransactionalEmail } from "@/lib/server/mailer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const result = await requestEmailVerification(body?.email ?? "");

  if (!result.success) {
    return NextResponse.json({ success: false, reason: result.reason }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const verificationUrl = buildVerificationUrl(origin, result.verificationToken);
  const emailResult = await sendTransactionalEmail(
    {
      to: result.email,
      subject: "Verifica la tua email",
      text: `Apri questo link per verificare il tuo account: ${verificationUrl}`,
      html: `<p>Verifica la tua email del genitore aprendo questo link:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
    },
    verificationUrl,
  );

  return NextResponse.json({
    success: true,
    previewUrl: emailResult.previewUrl,
    delivered: emailResult.delivered,
  });
}

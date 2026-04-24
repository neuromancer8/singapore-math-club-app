import { NextResponse } from "next/server";
import { ensureAuthStore, registerParent } from "@/lib/server/auth-store";
import { buildVerificationUrl, sendTransactionalEmail } from "@/lib/server/mailer";
import type { ParentRegistrationInput } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureAuthStore();
  const body = (await request.json().catch(() => null)) as ParentRegistrationInput | null;

  const result = await registerParent(
    body ?? {
      parentFirstName: "",
      parentLastName: "",
      email: "",
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

  const origin = new URL(request.url).origin;
  const verificationUrl = buildVerificationUrl(origin, result.verificationToken);
  const emailResult = await sendTransactionalEmail(
    {
      to: result.email,
      subject: "Verifica il tuo account genitore",
      text: `Apri questo link per verificare il tuo account: ${verificationUrl}`,
      html: `<p>Benvenuto in Singapore Math Club.</p><p>Verifica l'email del genitore aprendo questo link:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
    },
    verificationUrl,
  );

  return NextResponse.json({
    success: true,
    verificationRequired: true,
    email: result.email,
    previewUrl: emailResult.previewUrl,
    delivered: emailResult.delivered,
  });
}

type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type EmailResult = {
  delivered: boolean;
  previewUrl?: string;
};

function appBaseUrl(fallbackOrigin: string) {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.APP_BASE_URL?.trim() || fallbackOrigin || "https://singaporemathclub.app";
}

export function buildVerificationUrl(origin: string, token: string) {
  return `${appBaseUrl(origin)}/verifica-email?token=${encodeURIComponent(token)}`;
}

export function buildPasswordResetUrl(origin: string, token: string) {
  return `${appBaseUrl(origin)}/reimposta-password?token=${encodeURIComponent(token)}`;
}

export async function sendTransactionalEmail(message: EmailMessage, previewUrl: string): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "Singapore Math Club <noreply@singaporemathclub.app>";
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || "singaporemathclubrotary@gmail.com";

  if (!apiKey) {
    return { delivered: false, previewUrl };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      reply_to: replyTo,
      tags: [{ name: "app", value: "singapore-math-club" }],
    }),
  });

  if (!response.ok) {
    console.warn("Resend delivery failed", await response.text().catch(() => response.statusText));
    return { delivered: false, previewUrl };
  }

  return { delivered: true };
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token non valido.");
      return;
    }

    void fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => null)) as { success?: boolean; reason?: string } | null;
        if (!response.ok || !body?.success) {
          setStatus("error");
          setMessage(body?.reason === "expired" ? "Il link di verifica è scaduto." : "Il link di verifica non è valido.");
          return;
        }

        setStatus("success");
        setMessage("Email verificata correttamente. Ora puoi accedere come genitore.");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Non siamo riusciti a verificare l'email.");
      });
  }, [token]);

  return (
    <section className="card mx-auto max-w-2xl p-8">
      <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Verifica email</p>
      <h1 className="section-title mt-3 text-4xl font-black text-slate-900">Conferma del genitore</h1>
      <p className="mt-4 text-lg font-bold text-slate-600">
        {status === "loading" ? "Stiamo verificando il link..." : message}
      </p>
      <div className="mt-6">
        <Link href="/" className="cta-primary">
          Torna alla home
        </Link>
      </div>
    </section>
  );
}

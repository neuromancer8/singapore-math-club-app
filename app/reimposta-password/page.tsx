"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const body = (await response.json().catch(() => null)) as { success?: boolean; reason?: string } | null;

    if (!response.ok || !body?.success) {
      setStatus("error");
      setMessage(
        body?.reason === "expired"
          ? "Il link per reimpostare la password è scaduto."
          : body?.reason === "invalid_password"
            ? "La nuova password deve avere almeno 8 caratteri."
            : "Non siamo riusciti a reimpostare la password.",
      );
      return;
    }

    setStatus("success");
    setMessage("Password aggiornata. Ora puoi accedere con la nuova password.");
    setPassword("");
  }

  return (
    <section className="card mx-auto max-w-2xl p-8">
      <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Recupero password</p>
      <h1 className="section-title mt-3 text-4xl font-black text-slate-900">Imposta una nuova password</h1>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-slate-500">Nuova password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-lg font-black text-slate-900"
          />
        </label>
        {message ? (
          <p className={`m-0 rounded-[20px] px-4 py-3 text-base font-black ${status === "success" ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>
            {message}
          </p>
        ) : null}
        <button type="submit" className="cta-primary border-0">
          {status === "loading" ? "Salvataggio..." : "Salva nuova password"}
        </button>
      </form>

      <div className="mt-6">
        <Link href="/" className="cta-secondary">
          Torna alla home
        </Link>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.trim().length < 8) {
      setStatus("error");
      setMessage("La nuova password deve avere almeno 8 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Le due password non coincidono ancora.");
      return;
    }

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
    setConfirmPassword("");
  }

  return (
    <section className="card mx-auto max-w-2xl p-8">
      <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Recupero password</p>
      <h1 className="section-title mt-3 text-4xl font-black text-slate-900">Imposta una nuova password</h1>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-slate-500">Nuova password</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 pr-16 text-lg font-black text-slate-900"
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              title={showPassword ? "Nascondi password" : "Mostra password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-slate-500">Conferma password</span>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 pr-16 text-lg font-black text-slate-900"
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              onClick={() => setShowConfirmPassword((current) => !current)}
              aria-label={showConfirmPassword ? "Nascondi password" : "Mostra password"}
              title={showConfirmPassword ? "Nascondi password" : "Mostra password"}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
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

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.3A11.5 11.5 0 0 1 12 6c6.5 0 10 6 10 6a18.6 18.6 0 0 1-4.1 4.5" />
      <path d="M6.7 6.7C4.1 8.4 2 12 2 12s3.5 6 10 6c1.8 0 3.4-.4 4.8-1" />
      <path d="M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-.9" />
    </svg>
  );
}

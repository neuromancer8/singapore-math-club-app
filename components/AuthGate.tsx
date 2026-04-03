"use client";

import { useEffect, useState } from "react";
import { getAuthSession, getDemoCredentials, login } from "@/lib/auth";
import type { AuthSession } from "@/lib/types";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState<string>(getDemoCredentials().username);
  const [password, setPassword] = useState<string>(getDemoCredentials().password);
  const [error, setError] = useState("");

  useEffect(() => {
    const existingSession = getAuthSession();

    if (existingSession) {
      setSession(existingSession);
    }

    setReady(true);
  }, []);

  if (!ready) {
    return <div className="px-4 py-16 text-center text-lg font-bold text-slate-700">Caricamento ambiente...</div>;
  }

  if (!session) {
    return (
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 blur-[2px]">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-xl rounded-[36px] border border-white/60 bg-white/88 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.16)] backdrop-blur md:p-8">
            <div className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-black text-slate-900 shadow-sm">
              Accesso protetto fase MVP
            </div>
            <h1 className="section-title mt-5 text-4xl font-black text-slate-900 md:text-5xl">
              Entra nell&apos;app
            </h1>
            <p className="mt-4 text-lg font-bold leading-8 text-slate-600">
              Per questa fase iniziale usiamo un accesso semplice già precompilato. Più avanti lo collegheremo a un database utenti reale.
            </p>

            <form
              className="mt-8 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();

                const result = login(username, password);

                if (!result.success) {
                  setError("Credenziali non valide. Per ora usa admin e admin.");
                  return;
                }

                setError("");
                setSession(result.session);
              }}
            >
              <label className="block">
                <span className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-slate-500">Username</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-xl font-black text-slate-900"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-slate-500">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-xl font-black text-slate-900"
                />
              </label>

              {error ? <p className="m-0 rounded-[20px] bg-rose-100 px-4 py-3 text-base font-black text-rose-900">{error}</p> : null}

              <button type="submit" className="cta-primary w-full border-0">
                Accedi con admin
              </button>
            </form>

            <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
              <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-slate-400">Credenziali demo</p>
              <p className="mt-2 mb-0 text-base font-black text-slate-800">Username: admin</p>
              <p className="mt-1 mb-0 text-base font-black text-slate-800">Password: admin</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

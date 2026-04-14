"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAvatarOption } from "@/lib/avatars";
import { getAuthSession, getDemoCredentials, login, logout } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import type { AuthSession, SavedProgress } from "@/lib/types";

export function Header() {
  const [session, setSession] = useState<AuthSession | undefined>();
  const [progress, setProgress] = useState<SavedProgress | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState<string>(getDemoCredentials().username);
  const [password, setPassword] = useState<string>(getDemoCredentials().password);
  const [error, setError] = useState("");

  useEffect(() => {
    const existingSession = getAuthSession();

    setSession(existingSession);
    setProgress(existingSession ? getProgress() : null);
  }, []);

  const avatar = session ? getAvatarOption(session.avatarId) : undefined;

  return (
    <header className="sticky top-0 z-30 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[30px] border border-white/55 bg-white/72 px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-6">
        <Link href="/" className="flex items-center gap-4">
          <div className="overflow-hidden rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-black/5">
            <Image
              src="/logo-rotary.jpg"
              alt="Rotary Distretto 2041"
              width={170}
              height={66}
              className="h-auto w-[140px] md:w-[170px]"
              priority
            />
          </div>
          <div>
            <p className="section-title m-0 text-2xl font-black text-slate-900">Singapore Math Club</p>
            <p className="m-0 text-sm font-extrabold text-slate-600">Numeri, barre e strategie per la primaria</p>
          </div>
        </Link>

        <nav className="flex flex-wrap gap-2 text-sm font-extrabold text-slate-800">
          <Link href="/" className="pill bg-[var(--surface-soft)] shadow-sm">
            Home
          </Link>
          {session ? (
            <Link href="/risultati" className="pill bg-white ring-1 ring-black/5 shadow-sm">
              Risultati
            </Link>
          ) : null}
          <Link href="/genitori" className="pill bg-[var(--sky)] shadow-sm">
            Genitori
          </Link>
          {session && progress?.currentGrade ? (
            <span className="pill bg-white ring-1 ring-black/5 shadow-sm">
              Classe attiva: {progress.currentGrade}
            </span>
          ) : null}
          {session ? (
            <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1 ring-1 ring-black/5 shadow-sm">
              {avatar ? (
                <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${avatar.gradient} text-lg`} aria-label={avatar.label}>
                  {avatar.symbol}
                </span>
              ) : null}
              <button
                type="button"
                className="rounded-full border-0 bg-transparent px-3 py-2 font-extrabold text-slate-800"
                onClick={() => {
                  logout();
                  window.location.reload();
                }}
              >
                Esci ({session.firstName})
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="pill cursor-pointer border-0 bg-white ring-1 ring-black/5 shadow-sm"
              onClick={() => {
                setError("");
                setLoginOpen(true);
              }}
            >
              Accedi
            </button>
          )}
        </nav>
      </div>

      {loginOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[36px] border border-white/60 bg-white/92 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.18)] md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-black text-slate-900 shadow-sm">
                  Accesso fase MVP
                </div>
                <h2 className="section-title mt-4 text-4xl font-black text-slate-900">Accedi</h2>
                <p className="mt-3 text-base font-bold leading-7 text-slate-600">
                  La pagina resta visibile a tutti. L&apos;accesso serve per aprire la dashboard personale e salvare il percorso del bambino.
                </p>
              </div>
              <button
                type="button"
                className="pill cursor-pointer border-0 bg-white ring-1 ring-black/5 shadow-sm"
                onClick={() => setLoginOpen(false)}
              >
                Chiudi
              </button>
            </div>

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
                setLoginOpen(false);
                setProgress(getProgress());
                window.location.reload();
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
      ) : null}
    </header>
  );
}

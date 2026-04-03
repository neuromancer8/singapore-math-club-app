"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgePanel } from "@/components/BadgePanel";
import { getLastSession } from "@/lib/progress";
import type { StoredSessionResult } from "@/lib/types";

export default function RisultatiPage() {
  const [session, setSession] = useState<StoredSessionResult | undefined>();

  useEffect(() => {
    setSession(getLastSession());
  }, []);

  if (!session) {
    return (
      <div className="card p-6">
        <h1 className="section-title m-0 text-4xl font-black text-slate-900">Nessun risultato disponibile</h1>
        <p className="mt-3 text-lg font-bold text-slate-600">Completa una sessione per vedere stelle, badge e progressi.</p>
        <Link href="/" className="cta-primary mt-5">
          Torna alla home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="card overflow-hidden p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="pill bg-[var(--surface-soft)] text-slate-900">{session.grade}</span>
            <h1 className="section-title mt-3 text-4xl font-black text-slate-900">Sessione completata</h1>
            <p className="mt-3 mb-0 text-base font-bold text-slate-600">{messageForStars(session.stars)}</p>
          </div>
          <div className="text-3xl">
            {Array.from({ length: 3 }).map((_, index) => (
              <span key={index} className={index < session.stars ? "opacity-100" : "opacity-25"}>
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric label="Corrette" value={`${session.correct}/${session.total}`} />
          <Metric label="Serie" value={`${session.streak} giorni`} />
          <Metric label="Argomento" value={session.topic.replaceAll("-", " ")} />
        </div>

        <div className="mt-6 rounded-[24px] bg-slate-50 p-5">
          <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">Prossimo passo</p>
          <p className="mt-2 mb-0 text-lg font-black text-slate-900">
            {session.stars < 2
              ? "Ripeti lo stesso argomento per consolidare il metodo."
              : "Ottimo lavoro: puoi continuare nello stesso percorso o provare un altro argomento."}
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InsightCard
            label="Accuratezza"
            value={`${Math.round((session.correct / session.total) * 100)}%`}
            description="Percentuale di risposte corrette nella sessione."
          />
          <InsightCard
            label="Badge"
            value={session.badgeUnlocked ? "1" : "0"}
            description={session.badgeUnlocked ? `Nuovo badge: ${session.badgeUnlocked}` : "Nessun nuovo badge in questa sessione."}
          />
          <InsightCard
            label="Metodo"
            value={session.stars >= 2 ? "Solido" : "Da rinforzare"}
            description="Conta, visualizza e poi calcola: il ritmo giusto fa la differenza."
          />
        </div>
      </section>

      <aside className="space-y-4">
        <BadgePanel badges={session.badgeUnlocked ? [session.badgeUnlocked] : []} />
        <div className="card p-5">
          <div className="flex flex-col gap-3">
            <Link href={`/sessione/${session.grade}/${session.topic}`} className="cta-secondary">
              Ripeti lo stesso argomento
            </Link>
            <Link href={`/classe/${session.grade}`} className="cta-primary">
              Continua nella classe
            </Link>
            <Link href="/genitori" className="cta-secondary">
              Vai alla dashboard
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

function messageForStars(stars: number) {
  if (stars === 3) return "Precisione eccellente: il ragionamento è stato solido dall'inizio alla fine.";
  if (stars === 2) return "Buona sessione: siamo già su una base molto forte.";
  if (stars === 1) return "Buon inizio: con un altro giro questo argomento diventerà più sicuro.";
  return "Nessun problema: ogni tentativo aiuta a costruire il metodo.";
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-slate-50 p-4">
      <p className="m-0 text-sm font-extrabold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 mb-0 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function InsightCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-black/5">
      <p className="m-0 text-sm font-extrabold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 mb-0 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-3 mb-0 text-sm font-bold leading-6 text-slate-600">{description}</p>
    </div>
  );
}

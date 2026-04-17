"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgePanel } from "@/components/BadgePanel";
import { getLocale, gradeLabel, topicLabel, type Locale } from "@/lib/i18n";
import { getLastSession } from "@/lib/progress";
import type { StoredSessionResult } from "@/lib/types";

export default function RisultatiPage() {
  const [session, setSession] = useState<StoredSessionResult | undefined>();
  const [locale, setLocale] = useState<Locale>("it");

  useEffect(() => {
    setLocale(getLocale());
    setSession(getLastSession());
  }, []);

  if (!session) {
    return (
      <div className="card p-6">
        <h1 className="section-title m-0 text-4xl font-black text-slate-900">{locale === "it" ? "Nessun risultato disponibile" : "No results available"}</h1>
        <p className="mt-3 text-lg font-bold text-slate-600">
          {locale === "it" ? "Completa una sessione per vedere stelle, badge e progressi." : "Complete a session to see stars, badges and progress."}
        </p>
        <Link href="/" className="cta-primary mt-5">
          {locale === "it" ? "Torna alla home" : "Back to home"}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="card overflow-hidden p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="pill bg-[var(--surface-soft)] text-slate-900">{gradeLabel(session.grade, locale)}</span>
            <h1 className="section-title mt-3 text-4xl font-black text-slate-900">{locale === "it" ? "Sessione completata" : "Session completed"}</h1>
            <p className="mt-3 mb-0 text-base font-bold text-slate-600">{messageForStars(session.stars, locale)}</p>
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
          <Metric label={locale === "it" ? "Corrette" : "Correct"} value={`${session.correct}/${session.total}`} />
          <Metric label={locale === "it" ? "Serie" : "Streak"} value={`${session.streak} ${locale === "it" ? "giorni" : "days"}`} />
          <Metric label={locale === "it" ? "Argomento" : "Topic"} value={topicLabel(session.topic, session.topic.replaceAll("-", " "), locale)} />
        </div>

        <div className="mt-6 rounded-[24px] bg-slate-50 p-5">
          <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Prossimo passo" : "Next step"}</p>
          <p className="mt-2 mb-0 text-lg font-black text-slate-900">
            {session.stars < 2
              ? locale === "it" ? "Ripeti lo stesso argomento per consolidare il metodo." : "Repeat the same topic to strengthen the method."
              : locale === "it" ? "Ottimo lavoro: puoi continuare nello stesso percorso o provare un altro argomento." : "Great work: you can continue on the same path or try another topic."}
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InsightCard
            label={locale === "it" ? "Accuratezza" : "Accuracy"}
            value={`${Math.round((session.correct / session.total) * 100)}%`}
            description={locale === "it" ? "Percentuale di risposte corrette nella sessione." : "Percentage of correct answers in the session."}
          />
          <InsightCard
            label="Badge"
            value={session.badgeUnlocked ? "1" : "0"}
            description={
              session.badgeUnlocked
                ? `${locale === "it" ? "Nuovo badge" : "New badge"}: ${session.badgeUnlocked}`
                : locale === "it" ? "Nessun nuovo badge in questa sessione." : "No new badge in this session."
            }
          />
          <InsightCard
            label={locale === "it" ? "Metodo" : "Method"}
            value={session.stars >= 2 ? locale === "it" ? "Solido" : "Solid" : locale === "it" ? "Da rinforzare" : "To strengthen"}
            description={locale === "it" ? "Conta, visualizza e poi calcola: il ritmo giusto fa la differenza." : "Count, visualise and then calculate: the right rhythm makes the difference."}
          />
        </div>
      </section>

      <aside className="space-y-4">
        <BadgePanel badges={session.badgeUnlocked ? [session.badgeUnlocked] : []} locale={locale} />
        <div className="card p-5">
          <div className="flex flex-col gap-3">
            <Link href={`/sessione/${session.grade}/${session.topic}`} className="cta-secondary">
              {locale === "it" ? "Ripeti lo stesso argomento" : "Repeat the same topic"}
            </Link>
            <Link href={`/classe/${session.grade}`} className="cta-primary">
              {locale === "it" ? "Continua nella classe" : "Continue in the class"}
            </Link>
            <Link href="/genitori" className="cta-secondary">
              {locale === "it" ? "Vai alla dashboard" : "Go to dashboard"}
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

function messageForStars(stars: number, locale: Locale) {
  if (locale === "en") {
    if (stars === 3) return "Excellent accuracy: the reasoning was solid from start to finish.";
    if (stars === 2) return "Good session: we already have a very strong base.";
    if (stars === 1) return "Good start: with another round this topic will become safer.";
    return "No problem: every attempt helps build the method.";
  }

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

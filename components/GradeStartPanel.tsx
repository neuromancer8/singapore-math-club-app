"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { grades } from "@/data/grades";
import { getLocale, gradeLabel, type Locale } from "@/lib/i18n";
import { getProgress, setCurrentGrade } from "@/lib/progress";
import type { Grade, SavedProgress } from "@/lib/types";

const gradeStartText = {
  it: {
    stage: "Ingresso per classe",
    title: "Inizia",
    description:
      "Ogni percorso mantiene lo storico della classe corrente e di quelle già svolte, così quando il bambino arriva in terza o in quarta restano visibili anche i passi fatti prima.",
    sessions: "sessioni",
    iAmIn: "Sono di",
    history: "Storico",
    exercises: "esercizi",
    lastAccess: "ultimo accesso",
    neverStarted: "Mai avviata",
    subtitles: {
      seconda: "Numeri, addizioni, sottrazioni, primi problemi",
      terza: "Moltiplicazioni, divisioni semplici, problemi a passi",
      quarta: "Problemi complessi, frazioni intuitive, bar model",
    },
  },
  en: {
    stage: "Class entry",
    title: "Start",
    description:
      "Each path keeps the history of the current class and previous classes, so when the child reaches third or fourth grade the earlier steps remain visible.",
    sessions: "sessions",
    iAmIn: "I am in",
    history: "History",
    exercises: "exercises",
    lastAccess: "last access",
    neverStarted: "Never started",
    subtitles: {
      seconda: "Numbers, additions, subtractions, first problems",
      terza: "Multiplication, simple division, multi-step problems",
      quarta: "Complex problems, intuitive fractions, bar models",
    },
  },
} as const;

export function GradeStartPanel({ compact = false, locale: providedLocale }: { compact?: boolean; locale?: Locale }) {
  const [progress, setProgress] = useState<SavedProgress | null>(null);
  const [locale, setLocaleState] = useState<Locale>(providedLocale ?? "it");

  useEffect(() => {
    setProgress(getProgress());
    setLocaleState(providedLocale ?? getLocale());
  }, [providedLocale]);

  const t = gradeStartText[locale];

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-[0_22px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[34px] sm:p-6 md:p-7">
      <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.stage}</p>
      <h2 className="section-title mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{t.title}</h2>
      <p className="mt-3 text-sm font-bold leading-6 text-slate-600 sm:text-base sm:leading-7">
        {t.description}
      </p>

      <div className={`mt-6 grid gap-4 ${compact ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
        {grades.map((grade) => {
          const gradeProgress = progress?.byGrade?.[grade.value];
          const lastPlayed = gradeProgress?.lastPlayedAt
            ? new Date(gradeProgress.lastPlayedAt).toLocaleDateString(locale === "it" ? "it-IT" : "en-US")
            : t.neverStarted;

          return (
            <Link
              key={grade.value}
              href={`/classe/${grade.value}`}
              onClick={() => setCurrentGrade(grade.value)}
              className={`rounded-[28px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 shadow-sm transition hover:-translate-y-1 ${
                compact ? "p-4" : "p-5"
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="pill bg-[var(--surface-soft)] text-slate-900">{gradeLabel(grade.value, locale)}</span>
                <span className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">{gradeProgress?.totalSessions ?? 0} {t.sessions}</span>
              </div>
              <h3 className={`${compact ? "mt-3 text-xl leading-tight sm:text-2xl" : "mt-4 text-xl sm:text-2xl"} font-black text-slate-900`}>
                {t.iAmIn} {labelForCta(grade.value, locale)}
              </h3>
              <p className={`${compact ? "mt-2 text-sm leading-6" : "mt-3 text-base leading-7"} font-bold text-slate-600`}>{t.subtitles[grade.value]}</p>
              <div className={`${compact ? "mt-4 rounded-[20px] px-4 py-3" : "mt-5 rounded-[22px] px-4 py-3"} bg-white ring-1 ring-black/5`}>
                <p className="m-0 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{t.history} {gradeLabel(grade.value, locale)}</p>
                <p className="mt-2 mb-0 text-sm font-black leading-6 text-slate-800">
                  {gradeProgress?.totalSessions ?? 0} {t.sessions}, {gradeProgress?.totalExercises ?? 0} {t.exercises}, {t.lastAccess}: {lastPlayed}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function labelForCta(grade: Grade, locale: Locale) {
  if (locale === "en") {
    if (grade === "seconda") return "second grade";
    if (grade === "terza") return "third grade";
    return "fourth grade";
  }

  if (grade === "seconda") return "seconda elementare";
  if (grade === "terza") return "terza elementare";
  return "quarta elementare";
}

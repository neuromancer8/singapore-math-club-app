"use client";

import { useEffect, useState } from "react";
import { BadgePanel } from "@/components/BadgePanel";
import { getGrades } from "@/lib/exercises";
import { getLocale, gradeLabel, type Locale } from "@/lib/i18n";
import { getProgress } from "@/lib/progress";
import type { SavedProgress } from "@/lib/types";

export default function GenitoriPage() {
  const [progress, setProgress] = useState<SavedProgress | null>(null);
  const [locale, setLocale] = useState<Locale>("it");

  useEffect(() => {
    setLocale(getLocale());
    setProgress(getProgress());
  }, []);

  if (!progress) {
    return <div className="card p-6 text-lg font-bold text-slate-700">{locale === "it" ? "Caricamento dashboard..." : "Loading dashboard..."}</div>;
  }

  const accuracy = progress.totalExercises === 0 ? 0 : Math.round((progress.totalCorrect / progress.totalExercises) * 100);
  const metrics = [
    { label: locale === "it" ? "Sessioni" : "Sessions", value: String(progress.totalSessions), accent: "from-fuchsia-500 to-violet-500" },
    { label: locale === "it" ? "Accuratezza" : "Accuracy", value: `${accuracy}%`, accent: "from-cyan-400 to-blue-500" },
    { label: locale === "it" ? "Corrette" : "Correct", value: String(progress.totalCorrect), accent: "from-amber-400 to-orange-500" },
    { label: locale === "it" ? "Serie" : "Streak", value: `${progress.streak} ${locale === "it" ? "giorni" : "days"}`, accent: "from-emerald-400 to-teal-500" },
  ];
  const historyPreview = progress.history.slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-violet-600 via-purple-500 to-indigo-500 p-6 text-white shadow-[0_30px_90px_rgba(88,28,135,0.3)] md:p-8">
        <div className="absolute inset-y-8 right-8 hidden w-72 rounded-[28px] border border-white/20 bg-white/12 p-4 backdrop-blur md:block">
          <div className="rounded-[20px] bg-white/90 p-4 text-slate-900 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-500">Export</p>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">Word</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold">
              <div className="rounded-2xl border border-slate-200 p-3">Report PDF</div>
              <div className="rounded-2xl border border-slate-200 p-3">CSV</div>
              <div className="rounded-2xl border border-slate-200 p-3">Badge</div>
              <div className="rounded-2xl border border-slate-200 p-3">Word</div>
            </div>
          </div>
        </div>

        <div className="absolute -top-16 left-2 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl" />

        <div className="relative max-w-3xl">
          <h1 className="section-title text-4xl font-black leading-tight md:text-5xl">
            {locale === "it" ? "Controllo chiaro, visivo e immediato." : "Clear, visual and immediate monitoring."}
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-white/85">
            {locale === "it"
              ? "Un pannello per genitori e docenti con andamento, accuratezza, badge e fotografia rapida del percorso. Più vicino a un prodotto moderno, meno a un semplice riepilogo."
              : "A panel for parents and teachers with trends, accuracy, badges and a quick snapshot of the learning path. Closer to a modern product than a simple summary."}
          </p>
        </div>

        <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Metric key={metric.label} label={metric.label} value={metric.value} accent={metric.accent} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="relative">
          <div className="absolute inset-x-8 top-0 h-16 rounded-[28px] bg-gradient-to-r from-violet-400 to-blue-400 opacity-25 blur-2xl" />
          <div className="relative rounded-[34px] border border-slate-200/70 bg-white p-5 shadow-[0_22px_80px_rgba(15,23,42,0.08)] md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Overview</p>
                <h2 className="section-title mt-2 text-4xl font-black text-slate-900">{locale === "it" ? "Panoramica generale" : "General overview"}</h2>
              </div>
              <div className="flex gap-2 rounded-full bg-slate-100 p-1 text-xs font-black text-slate-500">
                <span className="rounded-full bg-white px-3 py-2 text-slate-900 shadow-sm">Live</span>
                <span className="px-3 py-2">Locale</span>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-100 bg-slate-50/80 p-4">
              <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[24px] bg-white p-4 shadow-sm">
                  <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Andamento" : "Trend"}</p>
                  <div className="mt-5 flex h-48 items-end gap-3 rounded-[20px] bg-gradient-to-b from-slate-50 to-white px-4 pb-4 pt-8">
                    {[28, 44, 36, 58, 42, 67, 61, 78].map((value, index) => (
                      <div key={index} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-[14px] bg-gradient-to-t from-fuchsia-500 via-violet-500 to-cyan-400"
                          style={{ height: `${value}%` }}
                        />
                        <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] bg-white p-4 shadow-sm">
                  <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Distribuzione" : "Distribution"}</p>
                  <div className="mt-6 flex items-center justify-center">
                    <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-[conic-gradient(from_180deg,#22d3ee_0_25%,#6366f1_25%_55%,#f97316_55%_78%,#ec4899_78%_100%)] p-5">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-center">
                        <div>
                          <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Totale" : "Total"}</p>
                          <p className="mt-2 mb-0 text-4xl font-black text-slate-900">{progress.totalExercises}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {getGrades().map((grade) => (
                <div key={grade.value} className="rounded-[26px] border border-slate-100 bg-white p-4 shadow-sm">
                  {(() => {
                    const gradeProgress = progress.byGrade[grade.value];
                    const gradeAccuracy =
                      gradeProgress.totalExercises === 0
                        ? 0
                        : Math.round((gradeProgress.totalCorrect / gradeProgress.totalExercises) * 100);

                    return (
                      <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="m-0 text-xl font-black text-slate-900">{gradeLabel(grade.value, locale)}</h3>
                      <p className="mt-1 mb-0 text-sm font-bold text-slate-600">{locale === "it" ? grade.subtitle : gradeSubtitle(grade.value)}</p>
                    </div>
                    <span className="pill bg-slate-100 text-slate-800">{grade.value}</span>
                  </div>
                  <div className="mt-4 space-y-3">
                        {[
                          { label: locale === "it" ? "Sessioni" : "Sessions", value: Math.min(100, gradeProgress.totalSessions * 12) },
                          { label: locale === "it" ? "Accuratezza" : "Accuracy", value: gradeAccuracy },
                          { label: locale === "it" ? "Progressione" : "Progression", value: Math.min(100, gradeProgress.bestStars * 33) },
                        ].map((bar) => (
                      <div key={`${grade.value}-${bar.label}`}>
                        <div className="mb-2 flex items-center justify-between text-sm font-black text-slate-500">
                          <span>{bar.label}</span>
                          <span>{bar.value}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500"
                            style={{ width: `${bar.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                        <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
                          <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Storico classe" : "Class history"}</p>
                          <p className="mt-2 mb-0 text-sm font-black text-slate-800">
                            {gradeProgress.totalSessions} {locale === "it" ? "sessioni" : "sessions"}, {gradeProgress.totalExercises} {locale === "it" ? "esercizi" : "exercises"}, {locale === "it" ? "migliori stelle" : "best stars"}: {gradeProgress.bestStars}
                          </p>
                          <p className="mt-2 mb-0 text-sm font-bold text-slate-600">
                            {locale === "it" ? "Argomenti recenti" : "Recent topics"}: {gradeProgress.recentTopics.length > 0 ? gradeProgress.recentTopics.join(", ") : locale === "it" ? "nessuno" : "none"}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/60 bg-white/78 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">Workspace</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">{locale === "it" ? "Stato attuale" : "Current status"}</h2>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700">{locale === "it" ? "Sincronizzato" : "Synced"}</div>
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: locale === "it" ? "Sessioni" : "Sessions", value: progress.totalSessions },
                  { label: locale === "it" ? "Corrette" : "Correct", value: progress.totalCorrect },
                  { label: locale === "it" ? "Esercizi" : "Exercises", value: progress.totalExercises },
                  { label: locale === "it" ? "Serie" : "Streak", value: progress.streak },
                ].map((item) => (
                  <div key={item.label} className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                    <p className="m-0 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="mt-2 mb-0 text-2xl font-black text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <BadgePanel badges={progress.badges} locale={locale} />

          <div className="rounded-[32px] border border-white/60 bg-white/78 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <h2 className="m-0 text-3xl font-black text-slate-900">{locale === "it" ? "Riepilogo salvato" : "Saved summary"}</h2>
            <div className="mt-5 space-y-3">
              <SummaryRow label={locale === "it" ? "Esercizi completati" : "Completed exercises"} value={String(progress.totalExercises)} tone="from-blue-500 to-cyan-400" />
              <SummaryRow label={locale === "it" ? "Corrette totali" : "Total correct"} value={String(progress.totalCorrect)} tone="from-violet-500 to-fuchsia-500" />
              <SummaryRow label={locale === "it" ? "Accuratezza media" : "Average accuracy"} value={`${accuracy}%`} tone="from-orange-400 to-rose-500" />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/78 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <h2 className="m-0 text-3xl font-black text-slate-900">{locale === "it" ? "Storico attività" : "Activity history"}</h2>
            <div className="mt-5 space-y-3">
              {historyPreview.length > 0 ? (
                historyPreview.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{item.grade}</p>
                        <p className="mt-2 mb-0 text-lg font-black text-slate-900">{item.topic.replaceAll("-", " ")}</p>
                        <p className="mt-2 mb-0 text-sm font-bold text-slate-600">
                          {item.correct}/{item.total} {locale === "it" ? "corrette" : "correct"}, {item.stars} {locale === "it" ? "stelle" : "stars"}
                        </p>
                      </div>
                      <span className="text-sm font-black text-slate-500">
                        {new Date(item.completedAt).toLocaleDateString(locale === "it" ? "it-IT" : "en-US")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="m-0 text-base font-bold text-slate-700">
                  {locale === "it" ? "Lo storico comparirà dopo le prime sessioni completate." : "The history will appear after the first completed sessions."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur">
      <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="mt-4 mb-0 text-xs font-black uppercase tracking-[0.22em] text-white/65">{label}</p>
      <p className="mt-3 mb-0 text-4xl font-black">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 mb-0 text-3xl font-black text-slate-900">{value}</p>
        </div>
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${tone} shadow-lg`} />
      </div>
    </div>
  );
}

function gradeSubtitle(value: string) {
  if (value === "seconda") return "Numbers, additions, subtractions, first problems";
  if (value === "terza") return "Multiplication, simple division, multi-step problems";
  return "Complex problems, intuitive fractions, bar models";
}

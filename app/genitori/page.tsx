"use client";

import { useEffect, useState } from "react";
import { BadgePanel } from "@/components/BadgePanel";
import { topicsByGrade } from "@/data/topics";
import { getGrades } from "@/lib/exercises";
import { formatCount } from "@/lib/format";
import { getLocale, gradeLabel, topicLabel, type Locale } from "@/lib/i18n";
import { getProgress } from "@/lib/progress";
import type { Grade, SavedProgress } from "@/lib/types";

export default function GenitoriPage() {
  const [progress, setProgress] = useState<SavedProgress | null>(null);
  const [locale, setLocale] = useState<Locale>("it");

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      setLocale(getLocale());
      setProgress(getProgress());
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!progress) {
    return <div className="card p-6 text-lg font-bold text-slate-700">{locale === "it" ? "Caricamento dashboard..." : "Loading dashboard..."}</div>;
  }

  const accuracy = progress.totalExercises === 0 ? 0 : Math.round((progress.totalCorrect / progress.totalExercises) * 100);
  const metrics = [
    { label: locale === "it" ? "Sessioni" : "Sessions", value: String(progress.totalSessions), accent: "from-fuchsia-500 to-violet-500" },
    { label: locale === "it" ? "Accuratezza" : "Accuracy", value: `${accuracy}%`, accent: "from-cyan-400 to-blue-500" },
    { label: locale === "it" ? "Corrette" : "Correct", value: String(progress.totalCorrect), accent: "from-amber-400 to-orange-500" },
    { label: locale === "it" ? "Serie" : "Streak", value: formatCount(progress.streak, locale, { it: { singular: "giorno", plural: "giorni" }, en: { singular: "day", plural: "days" } }), accent: "from-emerald-400 to-teal-500" },
  ];
  const historyPreview = progress.history.slice(0, 8);
  const hasHistory = progress.totalSessions > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-purple-500 to-indigo-500 p-5 text-white shadow-[0_30px_90px_rgba(88,28,135,0.3)] sm:rounded-[36px] sm:p-6 md:p-8">
        <div className="absolute -top-16 left-2 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl" />

        <div className="relative max-w-4xl">
          <h1 className="section-title text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            {locale === "it" ? "Controllo chiaro, visivo e immediato." : "Clear, visual and immediate monitoring."}
          </h1>
          <p className="mt-5 max-w-2xl text-base font-bold leading-7 text-white/85 sm:text-lg sm:leading-8">
            {locale === "it"
              ? "Un pannello per genitori e docenti con andamento, accuratezza, badge e una fotografia rapida del percorso."
              : "A panel for parents and teachers with trends, accuracy, badges and a quick snapshot of the learning path."}
          </p>
          <div className="mt-6 inline-flex max-w-xl rounded-[24px] border border-white/20 bg-white/12 px-4 py-4 text-sm font-bold leading-6 text-white/90 backdrop-blur">
            {locale === "it"
              ? "Report PDF e Word saranno disponibili in una prossima versione. Per ora la dashboard mostra i dati essenziali in modo chiaro."
              : "PDF and Word reports will be available in a future version. For now, the dashboard shows the essential data clearly."}
          </div>
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Metric key={metric.label} label={metric.label} value={metric.value} accent={metric.accent} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.35fr_0.9fr]">
        <div className="relative">
          <div className="absolute inset-x-8 top-0 h-16 rounded-[28px] bg-gradient-to-r from-violet-400 to-blue-400 opacity-25 blur-2xl" />
          <div className="relative rounded-[28px] border border-slate-200/70 bg-white p-4 shadow-[0_22px_80px_rgba(15,23,42,0.08)] sm:rounded-[34px] sm:p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{locale === "it" ? "Sintesi" : "Overview"}</p>
                <h2 className="section-title mt-2 text-3xl font-black text-slate-900 sm:text-4xl">{locale === "it" ? "Panoramica generale" : "General overview"}</h2>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-100 bg-slate-50/80 p-4">
              <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[24px] bg-white p-4 shadow-sm">
                  <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Andamento" : "Trend"}</p>
                  {hasHistory ? (
                    <div className="mt-5 flex h-40 items-end gap-2 rounded-[20px] bg-gradient-to-b from-slate-50 to-white px-3 pb-3 pt-6 sm:h-48 sm:gap-3 sm:px-4 sm:pb-4 sm:pt-8">
                      {historyPreview
                        .slice(0, 8)
                        .reverse()
                        .map((item, index) => {
                          const value = item.total === 0 ? 0 : Math.max(12, Math.round((item.correct / item.total) * 100));

                          return (
                            <div key={item.id} className="flex flex-1 flex-col items-center gap-2">
                              <div
                                className="w-full rounded-t-[14px] bg-gradient-to-t from-fuchsia-500 via-violet-500 to-cyan-400"
                                style={{ height: `${value}%` }}
                              />
                              <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                                {index + 1}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <EmptyChartState
                      title={locale === "it" ? "Nessuna sessione ancora completata" : "No sessions completed yet"}
                      description={locale === "it" ? "Il grafico comparirà dopo le prime attività concluse dal bambino." : "The chart will appear after the child's first completed activities."}
                    />
                  )}
                </div>

                <div className="rounded-[24px] bg-white p-4 shadow-sm">
                  <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Distribuzione" : "Distribution"}</p>
                  {hasHistory ? (
                    <div className="mt-6 flex items-center justify-center">
                      <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-[conic-gradient(from_180deg,#22d3ee_0_25%,#6366f1_25%_55%,#f97316_55%_78%,#ec4899_78%_100%)] p-4 sm:h-52 sm:w-52 sm:p-5">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-center">
                          <div>
                            <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Totale" : "Total"}</p>
                          <p className="mt-2 mb-0 text-3xl font-black text-slate-900 sm:text-4xl">{progress.totalExercises}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyChartState
                      title={locale === "it" ? "Distribuzione disponibile dopo i primi dati" : "Distribution available after the first data"}
                      description={locale === "it" ? "Quando ci saranno esercizi svolti, qui vedrai la ripartizione del lavoro." : "Once exercises have been completed, you will see the distribution of the work here."}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {getGrades().map((grade) => (
                <div key={grade.value} className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm sm:rounded-[26px]">
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
                      <h3 className="m-0 text-lg font-black text-slate-900 sm:text-xl">{gradeLabel(grade.value, locale)}</h3>
                      <p className="mt-1 mb-0 text-sm font-bold text-slate-600">{locale === "it" ? grade.subtitle : gradeSubtitle(grade.value)}</p>
                    </div>
                    <span className="pill bg-slate-100 text-slate-800">{gradeLabel(grade.value, locale)}</span>
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
                            {formatCount(gradeProgress.totalSessions, locale, { it: { singular: "sessione", plural: "sessioni" }, en: { singular: "session", plural: "sessions" } })}, {formatCount(gradeProgress.totalExercises, locale, { it: { singular: "esercizio", plural: "esercizi" }, en: { singular: "exercise", plural: "exercises" } })}, {locale === "it" ? "migliori stelle" : "best stars"}: {gradeProgress.bestStars}
                          </p>
                          <p className="mt-2 mb-0 text-sm font-bold text-slate-600">
                            {locale === "it" ? "Argomenti recenti" : "Recent topics"}: {recentTopicList(gradeProgress.recentTopics, grade.value, locale, locale === "it" ? "nessuno" : "none")}
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
                <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Area dati" : "Workspace"}</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">{locale === "it" ? "Stato attuale" : "Current status"}</h2>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-700">{locale === "it" ? "Sincronizzato" : "Synced"}</div>
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: locale === "it" ? "Sessioni" : "Sessions", value: progress.totalSessions },
                  { label: locale === "it" ? "Corrette" : "Correct", value: progress.totalCorrect },
                  { label: locale === "it" ? "Esercizi" : "Exercises", value: progress.totalExercises },
                  { label: locale === "it" ? "Serie" : "Streak", value: progress.streak },
                ].map((item) => (
                  <div key={item.label} className="rounded-[18px] bg-slate-50 px-3 py-4 text-center">
                    <p className="m-0 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="mt-2 mb-0 text-xl font-black text-slate-900 sm:text-2xl">{item.value}</p>
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div>
                        <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{gradeLabel(item.grade, locale)}</p>
                        <p className="mt-2 mb-0 text-lg font-black text-slate-900">{topicName(item.topic, item.grade, locale)}</p>
                        <p className="mt-2 mb-0 text-sm font-bold text-slate-600">
                          {item.correct}/{item.total} {locale === "it" ? "corrette" : "correct"}, {formatCount(item.stars, locale, { it: { singular: "stella", plural: "stelle" }, en: { singular: "star", plural: "stars" } })}
                        </p>
                      </div>
                      <span className="text-sm font-black text-slate-500 sm:text-right">
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
    <div className="rounded-[24px] border border-white/20 bg-white/10 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur sm:rounded-[28px] sm:p-5">
      <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="mt-4 mb-0 text-xs font-black uppercase tracking-[0.22em] text-white/65">{label}</p>
      <p className="mt-3 mb-0 text-3xl font-black sm:text-4xl">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 mb-0 text-2xl font-black text-slate-900 sm:text-3xl">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tone} shadow-lg sm:h-14 sm:w-14`} />
      </div>
    </div>
  );
}

function EmptyChartState({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-5 flex min-h-48 items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
      <div className="max-w-xs">
        <p className="m-0 text-base font-black text-slate-900">{title}</p>
        <p className="mt-3 mb-0 text-sm font-bold leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function gradeSubtitle(value: string) {
  if (value === "seconda") return "Numbers, additions, subtractions, first problems";
  if (value === "terza") return "Multiplication, simple division, multi-step problems";
  return "Complex problems, intuitive fractions, bar models";
}

function topicName(slug: string, grade: Grade, locale: Locale) {
  const topic = topicsByGrade[grade].find((item) => item.slug === slug);

  return topic ? topicLabel(topic.slug, topic.label, locale) : slug.replaceAll("-", " ");
}

function recentTopicList(topics: string[], grade: Grade, locale: Locale, emptyLabel: string) {
  if (topics.length === 0) return emptyLabel;

  return topics.map((topic) => topicName(topic, grade, locale)).join(", ");
}

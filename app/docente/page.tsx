"use client";

import { useEffect, useMemo, useState } from "react";
import { gradeLabel, topicLabel } from "@/lib/i18n";
import type { PedagogicalReviewItem } from "@/lib/pedagogical-review";
import type { LearnerProgressSummary } from "@/lib/types";

type TeacherResponse = {
  success: boolean;
  scope: "class" | "family";
  learners: LearnerProgressSummary[];
};

export default function DocentePage() {
  const [items, setItems] = useState<LearnerProgressSummary[]>([]);
  const [review, setReview] = useState<PedagogicalReviewItem[]>([]);
  const [scope, setScope] = useState<"class" | "family">("family");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/teacher/learners", { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: TeacherResponse | null) => {
        if (cancelled) return;
        setItems(data?.learners ?? []);
        setScope(data?.scope ?? "family");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    void fetch("/api/pedagogy/review")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { review?: PedagogicalReviewItem[] } | null) => {
        if (!cancelled) setReview(data?.review ?? []);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    const sessions = items.reduce((sum, item) => sum + item.progress.totalSessions, 0);
    const exercises = items.reduce((sum, item) => sum + item.progress.totalExercises, 0);
    const correct = items.reduce((sum, item) => sum + item.progress.totalCorrect, 0);
    return {
      sessions,
      exercises,
      correct,
      accuracy: exercises === 0 ? 0 : Math.round((correct / exercises) * 100),
    };
  }, [items]);

  if (loading) {
    return <div className="card p-6 text-lg font-bold text-slate-700">Caricamento dashboard docente...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/60 bg-white/80 p-5 shadow-[0_22px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-7">
        <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">
          {scope === "class" ? "Dashboard docente" : "Dashboard famiglia"}
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="section-title m-0 text-4xl font-black text-slate-900 md:text-5xl">Progressi multi-alunno</h1>
            <p className="mt-4 mb-0 max-w-3xl text-base font-bold leading-7 text-slate-600">
              Vista aggregata da PostgreSQL: ogni riga legge il profilo bambino, la famiglia e lo storico salvato in cloud.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a className="cta-secondary border-0" href="/api/progress/export?format=csv">CSV</a>
            <a className="cta-secondary border-0" href="/api/progress/export?format=pdf">PDF</a>
            <a className="cta-secondary border-0" href="/api/progress/export?format=word">Word</a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Alunni" value={String(items.length)} />
          <Metric label="Sessioni" value={String(totals.sessions)} />
          <Metric label="Esercizi" value={String(totals.exercises)} />
          <Metric label="Accuratezza" value={`${totals.accuracy}%`} />
        </div>
      </section>

      <section className="rounded-[32px] border border-white/60 bg-white/80 p-5 shadow-[0_22px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">Revisione pedagogica</p>
            <h2 className="mt-2 mb-0 text-3xl font-black text-slate-900">Moduli, prerequisiti e copertura CPA</h2>
          </div>
          <span className="pill bg-slate-100 text-slate-800">{review.filter((item) => item.status === "ready").length}/{review.length} pronti</span>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {review.slice(0, 9).map((item) => (
            <div key={`${item.grade}-${item.topic}`} className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm">
              <p className="m-0 text-xs font-black uppercase tracking-[0.16em] text-slate-400">{gradeLabel(item.grade, "it")}</p>
              <h3 className="mt-2 mb-0 text-lg font-black text-slate-900">{item.label}</h3>
              <p className="mt-2 mb-0 text-sm font-bold text-slate-600">Prerequisiti: {item.prerequisites.join(", ") || "base"}</p>
              <p className="mt-2 mb-0 text-sm font-bold text-slate-600">Esercizi: {item.exerciseCount} | Difficoltà: {item.difficultyCoverage.join(", ")}</p>
              <p className={`mt-3 mb-0 text-sm font-black ${item.status === "ready" ? "text-emerald-700" : item.status === "watch" ? "text-amber-700" : "text-rose-700"}`}>
                {item.status === "ready" ? "Pronto" : item.status === "watch" ? "Da monitorare" : "Da rafforzare"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        {items.length === 0 ? (
          <div className="card p-6 text-base font-bold text-slate-700">Accedi come docente o completa almeno un profilo alunno per vedere la dashboard.</div>
        ) : (
          items.map((item) => {
            const accuracy = item.progress.totalExercises === 0 ? 0 : Math.round((item.progress.totalCorrect / item.progress.totalExercises) * 100);
            const latest = item.progress.history[0];
            return (
              <article key={item.learner.id} className="rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.07)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="m-0 text-2xl font-black text-slate-900">{item.learner.fullName}</h2>
                    <p className="mt-2 mb-0 text-sm font-bold text-slate-500">
                      {gradeLabel(item.learner.learnerGrade, "it")} | {item.parentFullName} | {item.parentEmail}
                    </p>
                  </div>
                  <span className="pill bg-emerald-50 text-emerald-800">
                    {item.updatedAt ? `sync ${new Date(item.updatedAt).toLocaleDateString("it-IT")}` : "cloud pronto"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <Small label="Sessioni" value={item.progress.totalSessions} />
                  <Small label="Esercizi" value={item.progress.totalExercises} />
                  <Small label="Corrette" value={item.progress.totalCorrect} />
                  <Small label="Accuratezza" value={`${accuracy}%`} />
                </div>

                <div className="mt-5 rounded-[22px] bg-slate-50 p-4">
                  <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Ultima attività</p>
                  <p className="mt-2 mb-0 text-sm font-bold text-slate-700">
                    {latest
                      ? `${topicLabel(latest.topic, latest.topic, "it")} (${gradeLabel(latest.grade, "it")}): ${latest.correct}/${latest.total}, ${latest.stars} stelle`
                      : "Nessuna sessione completata."}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-slate-50 p-4">
      <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 mb-0 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function Small({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[20px] border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <p className="m-0 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 mb-0 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

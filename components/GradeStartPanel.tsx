"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { grades } from "@/data/grades";
import { getProgress, setCurrentGrade } from "@/lib/progress";
import type { Grade, SavedProgress } from "@/lib/types";

const gradeLabels: Record<Grade, string> = {
  seconda: "Seconda elementare",
  terza: "Terza elementare",
  quarta: "Quarta elementare",
};

export function GradeStartPanel() {
  const [progress, setProgress] = useState<SavedProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  return (
    <div className="rounded-[34px] border border-white/60 bg-white/85 p-6 shadow-[0_22px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-7">
      <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Ingresso per classe</p>
      <h2 className="section-title mt-3 text-4xl font-black text-slate-900">Inizia</h2>
      <p className="mt-3 text-base font-bold leading-7 text-slate-600">
        Ogni percorso mantiene lo storico della classe corrente e di quelle già svolte, così quando il bambino arriva in terza o in quarta restano visibili anche i passi fatti prima.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {grades.map((grade) => {
          const gradeProgress = progress?.byGrade?.[grade.value];
          const lastPlayed = gradeProgress?.lastPlayedAt
            ? new Date(gradeProgress.lastPlayedAt).toLocaleDateString("it-IT")
            : "Mai avviata";

          return (
            <Link
              key={grade.value}
              href={`/classe/${grade.value}`}
              onClick={() => setCurrentGrade(grade.value)}
              className="rounded-[28px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-1"
            >
              <span className="pill bg-[var(--surface-soft)] text-slate-900">{grade.value}</span>
              <h3 className="mt-4 text-2xl font-black text-slate-900">Sono di {labelForCta(grade.value)}</h3>
              <p className="mt-3 text-base font-bold leading-7 text-slate-600">{grade.subtitle}</p>
              <div className="mt-5 rounded-[22px] bg-white px-4 py-3 ring-1 ring-black/5">
                <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Storico {gradeLabels[grade.value]}</p>
                <p className="mt-2 mb-0 text-sm font-black text-slate-800">
                  {gradeProgress?.totalSessions ?? 0} sessioni, {gradeProgress?.totalExercises ?? 0} esercizi, ultimo accesso: {lastPlayed}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function labelForCta(grade: Grade) {
  if (grade === "seconda") return "seconda elementare";
  if (grade === "terza") return "terza elementare";
  return "quarta elementare";
}

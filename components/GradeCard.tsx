import Link from "next/link";
import type { GradeOption } from "@/lib/types";

function gradientForGrade(value: GradeOption["value"]) {
  if (value === "seconda") return "from-orange-300 via-amber-200 to-yellow-100";
  if (value === "terza") return "from-cyan-300 via-sky-200 to-white";
  return "from-emerald-300 via-lime-200 to-white";
}

export function GradeCard({ grade, totalExercises }: { grade: GradeOption; totalExercises: number }) {
  return (
    <Link
      href={`/classe/${grade.value}`}
      className={`card flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br ${gradientForGrade(grade.value)} p-6 transition-transform hover:-translate-y-1`}
    >
      <div className="space-y-4">
        <span className="pill w-fit bg-white/85 text-slate-900">{grade.value}</span>
        <div>
          <h2 className="section-title m-0 text-3xl font-black text-slate-900">{grade.title}</h2>
          <p className="mt-2 text-base font-bold leading-7 text-slate-700">{grade.subtitle}</p>
        </div>
      </div>
      <div className="mt-6 rounded-[24px] bg-white/85 px-4 py-3 text-sm font-extrabold text-slate-700">{totalExercises} esercizi disponibili</div>
    </Link>
  );
}

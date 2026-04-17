import Link from "next/link";
import { gradeLabel, type Locale } from "@/lib/i18n";
import type { GradeOption } from "@/lib/types";

function gradientForGrade(value: GradeOption["value"]) {
  if (value === "seconda") return "from-orange-300 via-amber-200 to-yellow-100";
  if (value === "terza") return "from-cyan-300 via-sky-200 to-white";
  return "from-emerald-300 via-lime-200 to-white";
}

export function GradeCard({ grade, totalExercises, locale = "it" }: { grade: GradeOption; totalExercises: number; locale?: Locale }) {
  const title = gradeLabel(grade.value, locale);
  const subtitle = locale === "it" ? grade.subtitle : subtitleForGrade(grade.value);

  return (
    <Link
      href={`/classe/${grade.value}`}
      className={`card flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br ${gradientForGrade(grade.value)} p-6 transition-transform hover:-translate-y-1`}
    >
      <div className="space-y-4">
        <span className="pill w-fit bg-white/85 text-slate-900">{gradeLabel(grade.value, locale)}</span>
        <div>
          <h2 className="section-title m-0 text-3xl font-black text-slate-900">{title}</h2>
          <p className="mt-2 text-base font-bold leading-7 text-slate-700">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6 rounded-[24px] bg-white/85 px-4 py-3 text-sm font-extrabold text-slate-700">
        {locale === "it"
          ? `${totalExercises} esercizi disponibili. Entra come ${grade.title.toLowerCase()}.`
          : `${totalExercises} exercises available. Enter as ${title.toLowerCase()}.`}
      </div>
    </Link>
  );
}

function subtitleForGrade(value: GradeOption["value"]) {
  if (value === "seconda") return "Numbers, additions, subtractions, first problems";
  if (value === "terza") return "Multiplication, simple division, multi-step problems";
  return "Complex problems, intuitive fractions, bar models";
}

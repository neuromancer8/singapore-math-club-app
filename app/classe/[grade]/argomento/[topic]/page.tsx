import Link from "next/link";
import { notFound } from "next/navigation";
import { getExercisesByTopic, getTopic, isGradeSlug } from "@/lib/exercises";
import { getSessionSize } from "@/lib/session";
import type { DifficultyFilter } from "@/lib/types";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ grade: string; topic: string }>;
}) {
  const { grade, topic } = await params;

  if (!isGradeSlug(grade)) notFound();

  const topicMeta = getTopic(grade, topic);
  if (!topicMeta) notFound();

  const exercises = getExercisesByTopic(grade, topic);
  const sessionSize = Math.min(getSessionSize(), exercises.length);
  const difficultyCounts = {
    facile: exercises.filter((exercise) => exercise.difficulty === 1).length,
    media: exercises.filter((exercise) => exercise.difficulty === 2).length,
    avanzata: exercises.filter((exercise) => exercise.difficulty === 3).length,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="card p-6 md:p-8">
        <div className="flex flex-wrap gap-2">
          <span className="pill bg-[var(--surface-soft)] text-slate-900">{grade}</span>
          <span className="pill bg-[var(--sky)] text-slate-900">{topicMeta.label}</span>
        </div>
        <h1 className="section-title mt-5 text-5xl font-black text-slate-900">{topicMeta.label}</h1>
        <p className="mt-4 text-lg font-bold leading-8 text-slate-600">{topicMeta.description}</p>

        <div className="soft-card mt-6 p-5">
          <h2 className="m-0 text-2xl font-black text-slate-900">Cosa farai</h2>
          <ul className="mt-4 space-y-3 pl-5 text-base font-bold text-slate-700">
            <li>Allenamento breve con {sessionSize} esercizi scelti per una sessione fluida.</li>
            <li>Feedback dopo ogni esercizio.</li>
            <li>Stelle, badge e progressi salvati nel browser.</li>
          </ul>
        </div>

        <div className="mt-6 rounded-[26px] bg-slate-50 p-5">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Disponibilità</p>
          <p className="mt-2 mb-0 text-3xl font-black text-slate-900">{exercises.length} esercizi nel topic</p>
          <p className="mt-2 mb-0 text-base font-bold text-slate-600">Ogni sessione ne propone un mix breve e ben distribuito.</p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Percorso consigliato</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/sessione/${grade}/${topic}?mode=standard&difficulty=all`} className="cta-primary">
                Sessione bilanciata
              </Link>
              <Link href={`/sessione/${grade}/${topic}?mode=adaptive&difficulty=all`} className="cta-secondary">
                Sessione adattiva
              </Link>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Filtra per difficoltà</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {([
                { label: "Solo facile", value: "facile", count: difficultyCounts.facile },
                { label: "Solo media", value: "media", count: difficultyCounts.media },
                { label: "Solo avanzata", value: "avanzata", count: difficultyCounts.avanzata },
              ] as { label: string; value: DifficultyFilter; count: number }[]).map((item) => (
                <Link
                  key={item.value}
                  href={`/sessione/${grade}/${topic}?mode=standard&difficulty=${item.value}`}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-base font-black text-slate-800 shadow-sm"
                >
                  {item.label}
                  <span className="mt-2 block text-sm text-slate-500">{item.count} esercizi disponibili</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/classe/${grade}`} className="cta-secondary">
              Torna agli argomenti
            </Link>
          </div>
        </div>
      </section>

      <aside className="card p-6">
        <h2 className="section-title m-0 text-3xl font-black text-slate-900">Anteprima esercizi</h2>
        <div className="mt-5 space-y-3">
          {exercises.slice(0, 5).map((exercise) => (
            <div key={exercise.id} className="rounded-[24px] bg-slate-50 p-4">
              <p className="m-0 text-sm font-extrabold uppercase tracking-wide text-slate-500">{exercise.type}</p>
              <p className="mt-2 mb-0 text-base font-black text-slate-900">{exercise.prompt}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

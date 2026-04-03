import Link from "next/link";
import { notFound } from "next/navigation";
import { getExercisesByTopic, getTopic, isGradeSlug } from "@/lib/exercises";
import { getSessionSize } from "@/lib/session";

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

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/sessione/${grade}/${topic}`} className="cta-primary">
            Inizia sessione
          </Link>
          <Link href={`/classe/${grade}`} className="cta-secondary">
            Torna agli argomenti
          </Link>
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

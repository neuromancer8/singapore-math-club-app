import Link from "next/link";
import { notFound } from "next/navigation";
import { getExercisesByTopic, getTopic, isGradeSlug } from "@/lib/exercises";
import { describeSessionArc } from "@/lib/pedagogy";
import { getSessionSize } from "@/lib/session";
import { cpaStageLabel, difficultyLabel, gradeLabel, topicDescription, topicLabel } from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";
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

  const locale = await getServerLocale();
  const exercises = getExercisesByTopic(grade, topic);
  const localizedTopicLabel = topicLabel(topic, topicMeta.label, locale);
  const localizedTopicDescription = topicDescription(topic, topicMeta.description, locale);
  const localizedFocus = locale === "it" ? topicMeta.focus : topicMeta.focusEn;
  const localizedGoals = locale === "it" ? topicMeta.goals : topicMeta.goalsEn;
  const sessionSize = Math.min(getSessionSize(), exercises.length);
  const sessionArc = describeSessionArc(exercises.slice(0, sessionSize));
  const difficultyCounts = {
    facile: exercises.filter((exercise) => exercise.difficulty === 1).length,
    media: exercises.filter((exercise) => exercise.difficulty === 2).length,
    avanzata: exercises.filter((exercise) => exercise.difficulty === 3).length,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="card p-6 md:p-8">
        <div className="flex flex-wrap gap-2">
          <span className="pill bg-[var(--surface-soft)] text-slate-900">{gradeLabel(grade, locale)}</span>
          <span className="pill bg-[var(--sky)] text-slate-900">{localizedTopicLabel}</span>
        </div>
        <h1 className="section-title mt-5 text-5xl font-black text-slate-900">{localizedTopicLabel}</h1>
        <p className="mt-4 text-lg font-bold leading-8 text-slate-600">{localizedTopicDescription}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[26px] bg-slate-50 p-5">
            <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{locale === "it" ? "Focus didattico" : "Learning focus"}</p>
            <p className="mt-3 mb-0 text-lg font-black text-slate-900">{localizedFocus}</p>
          </div>
          <div className="rounded-[26px] bg-slate-50 p-5">
            <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{locale === "it" ? "Ingresso CPA" : "CPA entry point"}</p>
            <p className="mt-3 mb-0 text-lg font-black text-slate-900">{cpaStageLabel(topicMeta.cpaStage, locale)}</p>
          </div>
        </div>

        <div className="soft-card mt-6 p-5">
          <h2 className="m-0 text-2xl font-black text-slate-900">{locale === "it" ? "Cosa farai" : "What you will do"}</h2>
          <ul className="mt-4 space-y-3 pl-5 text-base font-bold text-slate-700">
            <li>{locale === "it" ? `Allenamento breve con ${sessionSize} esercizi scelti per una sessione fluida.` : `Short practice with ${sessionSize} exercises chosen for a smooth session.`}</li>
            <li>{locale === "it" ? "Feedback dopo ogni esercizio." : "Feedback after each exercise."}</li>
            <li>{locale === "it" ? "Stelle, badge e progressi salvati nel browser." : "Stars, badges and progress saved in the browser."}</li>
          </ul>
        </div>

        <div className="mt-6 rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{locale === "it" ? "Obiettivi del modulo" : "Module goals"}</p>
          <ul className="mt-4 space-y-3 pl-5 text-base font-bold text-slate-700">
            {localizedGoals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-[26px] bg-slate-50 p-5">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{locale === "it" ? "Disponibilità" : "Availability"}</p>
          <p className="mt-2 mb-0 text-3xl font-black text-slate-900">
            {exercises.length} {locale === "it" ? "esercizi nel topic" : "exercises in this topic"}
          </p>
          <p className="mt-2 mb-0 text-base font-bold text-slate-600">
            {locale === "it" ? "Ogni sessione ne propone un mix breve e ben distribuito." : "Each session offers a short and well-balanced mix."}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{locale === "it" ? "Percorso consigliato" : "Recommended path"}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/sessione/${grade}/${topic}?mode=standard&difficulty=all`} className="cta-primary">
                {locale === "it" ? "Sessione bilanciata" : "Balanced session"}
              </Link>
              <Link href={`/sessione/${grade}/${topic}?mode=adaptive&difficulty=all`} className="cta-secondary">
                {locale === "it" ? "Sessione adattiva" : "Adaptive session"}
              </Link>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{locale === "it" ? "Filtra per difficoltà" : "Filter by difficulty"}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {([
                { label: locale === "it" ? "Solo facile" : "Easy only", value: "facile", count: difficultyCounts.facile },
                { label: locale === "it" ? "Solo media" : "Medium only", value: "media", count: difficultyCounts.media },
                { label: locale === "it" ? "Solo avanzata" : "Advanced only", value: "avanzata", count: difficultyCounts.avanzata },
              ] as { label: string; value: DifficultyFilter; count: number }[]).map((item) => (
                <Link
                  key={item.value}
                  href={`/sessione/${grade}/${topic}?mode=standard&difficulty=${item.value}`}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-base font-black text-slate-800 shadow-sm"
                >
                  {item.label}
                  <span className="mt-2 block text-sm text-slate-500">
                    {item.count} {locale === "it" ? "esercizi disponibili" : "exercises available"}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/classe/${grade}`} className="cta-secondary">
              {locale === "it" ? "Torna agli argomenti" : "Back to topics"}
            </Link>
          </div>
        </div>
      </section>

      <aside className="card p-6">
        <h2 className="section-title m-0 text-3xl font-black text-slate-900">{locale === "it" ? "Anteprima esercizi" : "Exercise preview"}</h2>
        <div className="mt-4 rounded-[24px] bg-slate-50 p-4">
          <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Arco della sessione" : "Session arc"}</p>
          <p className="mt-2 mb-0 text-base font-black text-slate-900">
            {locale === "it"
              ? `${sessionArc.byStage.Concrete} concreti, ${sessionArc.byStage.Pittorico} pittorici, ${sessionArc.byStage.Astratto} astratti.`
              : `${sessionArc.byStage.Concrete} concrete, ${sessionArc.byStage.Pittorico} pictorial, ${sessionArc.byStage.Astratto} abstract.`}
          </p>
          <p className="mt-2 mb-0 text-sm font-bold text-slate-600">
            {locale === "it"
              ? "La sessione procede dai passaggi più accessibili verso quelli più autonomi."
              : "The session moves from more accessible steps towards more independent ones."}
          </p>
        </div>
        <div className="mt-5 space-y-3">
          {exercises.slice(0, 5).map((exercise) => (
            <div key={exercise.id} className="rounded-[24px] bg-slate-50 p-4">
              <p className="m-0 text-sm font-extrabold uppercase tracking-wide text-slate-500">{difficultyLabel(exercise.difficulty, locale)}</p>
              <p className="mt-2 mb-0 text-base font-black text-slate-900">
                {locale === "en" && exercise.promptEn ? exercise.promptEn : exercise.prompt}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

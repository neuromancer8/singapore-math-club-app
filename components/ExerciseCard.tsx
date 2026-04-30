"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { awardBadges } from "@/lib/badges";
import { describeSessionArc, getAdaptiveNarrative, getExerciseStage, getPedagogicalSteps, getPedagogicalTip, getTopicEntry } from "@/lib/pedagogy";
import { checkExerciseAnswer, createSessionSummary } from "@/lib/scoring";
import { getProgress, saveSessionResult } from "@/lib/progress";
import { buildSessionExercises, getAdaptiveProfile } from "@/lib/session";
import { cpaStageLabel, difficultyLabel, exerciseTypeLabel, getLocale, gradeLabel, topicLabel, type Locale } from "@/lib/i18n";
import type { DifficultyFilter, Exercise, Grade, SessionAnswer, SessionHistoryItem, SessionMode } from "@/lib/types";
import { ProgressBar } from "@/components/ProgressBar";

type AnswerValue = string;

export function ExerciseCard({
  exercises,
  grade,
  topic,
  topicTitle,
  difficultyFilter,
  mode,
}: {
  exercises: Exercise[];
  grade: Grade;
  topic: string;
  topicTitle: string;
  difficultyFilter: DifficultyFilter;
  mode: SessionMode;
}) {
  const router = useRouter();
  const [sessionExercises, setSessionExercises] = useState<Exercise[]>([]);
  const [topicHistory, setTopicHistory] = useState<SessionHistoryItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<SessionAnswer[]>([]);
  const [locale, setLocale] = useState<Locale>("it");

  useEffect(() => {
    const progress = getProgress();
    const history = progress.history.filter((item) => item.grade === grade && item.topic === topic).slice(0, 6);

    setTopicHistory(history);
    setSessionExercises(
      buildSessionExercises({
        exercises,
        difficultyFilter,
        mode,
        history,
      }),
    );
    setIndex(0);
    setAnswers({});
    setChecked(false);
    setResults([]);
    setLocale(getLocale());
  }, [difficultyFilter, exercises, grade, mode, topic]);

  const exercise = sessionExercises[index];
  const adaptiveProfile = useMemo(() => getAdaptiveProfile(topicHistory), [topicHistory]);
  const topicEntry = useMemo(() => getTopicEntry(grade, topic), [grade, topic]);
  const sessionArc = useMemo(() => describeSessionArc(sessionExercises), [sessionExercises]);
  const correctCount = useMemo(() => results.filter((item) => item.correct).length, [results]);
  const sessionStars = useMemo(
    () => createSessionSummary(correctCount, sessionExercises.length || 1).stars,
    [correctCount, sessionExercises.length],
  );

  if (!exercise) {
    return <div className="card p-6 text-lg font-bold text-slate-700">{locale === "it" ? "Preparazione della sessione..." : "Preparing the session..."}</div>;
  }

  const answer = answers[exercise.id] ?? "";
  const exercisePrompt = locale === "en" && exercise.promptEn ? exercise.promptEn : exercise.prompt;
  const exerciseOptions = locale === "en" && exercise.optionsEn ? exercise.optionsEn : exercise.options;
  const exerciseExplanation = locale === "en" && exercise.explanationEn ? exercise.explanationEn : exercise.explanation;
  const exerciseVisualModel = locale === "en" && exercise.visualModelEn ? exercise.visualModelEn : exercise.visualModel;
  const pedagogicalTip = getPedagogicalTip(exercise, locale);
  const methodSteps = getPedagogicalSteps(locale, topicEntry?.cpaStage ?? "Concrete");
  const stageLabel = cpaStageLabel(getExerciseStage(exercise), locale);

  const canCheck = String(answer).trim().length > 0;
  const currentResult = results.find((item) => item.exerciseId === exercise.id);
  const remainingExercises = sessionExercises.length - index - 1;
  const progressRatio = Math.round(((index + 1) / sessionExercises.length) * 100);

  function setAnswer(value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [exercise.id]: value }));
  }

  function validateCurrent() {
    const correct = checkExerciseAnswer(answer, exercise.correctAnswer);
    const userAnswer = String(answer);

    setResults((prev) => [
      ...prev.filter((item) => item.exerciseId !== exercise.id),
      { exerciseId: exercise.id, correct, userAnswer },
    ]);
    setChecked(true);
  }

  function goNext() {
    if (index === sessionExercises.length - 1) {
      const progress = getProgress();
      const summary = createSessionSummary(correctCount, sessionExercises.length);
      const streakSeed = progress.streak > 0 ? progress.streak + 1 : 1;
      const newBadges = awardBadges({
        existingBadges: progress.badges,
        stars: summary.stars,
        streak: streakSeed,
        correctAnswers: correctCount,
      });
      const badgeUnlocked = newBadges.find((badge) => !progress.badges.includes(badge));

      saveSessionResult({
        grade,
        topic,
        total: sessionExercises.length,
        correct: correctCount,
        stars: summary.stars,
        badgeUnlocked,
        streak: streakSeed,
        completedAt: new Date().toISOString(),
        answers: results,
      });

      router.push("/risultati");
      return;
    }

    setChecked(false);
    setIndex((prev) => prev + 1);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
      <section className="card overflow-hidden p-4 sm:p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="pill bg-[var(--surface-soft)] text-slate-900">{gradeLabel(grade, locale)}</div>
            <h1 className="section-title mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{topicLabel(topic, topicTitle, locale)}</h1>
            <p className="mt-3 mb-0 text-sm font-bold text-slate-600 sm:text-base">
              {locale === "it"
                ? `Esercizio ${index + 1} di ${sessionExercises.length}. Sessione breve, guidata e con feedback immediato.`
                : `Exercise ${index + 1} of ${sessionExercises.length}. A short, guided session with immediate feedback.`}
            </p>
          </div>
          <div className="text-2xl" aria-label={`${sessionStars} ${locale === "it" ? "stelle" : "stars"}`}>
            {Array.from({ length: 3 }).map((_, starIndex) => (
              <span key={starIndex} className={starIndex < sessionStars ? "opacity-100" : "opacity-25"}>
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <ProgressBar current={index + 1} total={sessionExercises.length} locale={locale} />
        </div>

        <div className="mt-6 rounded-[26px] bg-gradient-to-br from-white to-slate-50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="flex flex-wrap gap-2">
            <span className="pill bg-white ring-1 ring-black/5">{exerciseTypeLabel(exercise.type, locale)}</span>
            <span className="pill bg-[var(--sky)] text-slate-900">{difficultyLabel(exercise.difficulty, locale)}</span>
            <span className="pill bg-white ring-1 ring-black/5">{stageLabel}</span>
            <span className="pill bg-white ring-1 ring-black/5">{progressRatio}% {locale === "it" ? "completato" : "complete"}</span>
            <span className="pill bg-white ring-1 ring-black/5">{labelForMode(mode, locale)}</span>
            <span className="pill bg-white ring-1 ring-black/5">{labelForDifficultyFilter(difficultyFilter, locale)}</span>
          </div>

          <h2 className="mt-4 text-xl font-black text-slate-900 sm:text-2xl">{exercisePrompt}</h2>

          {exerciseVisualModel ? (
            <div className="soft-card mt-4 p-4 text-base font-bold text-slate-700">{exerciseVisualModel}</div>
          ) : null}

          <div className="mt-6">{renderAnswerArea(exercise, exerciseOptions, answer, setAnswer, checked ? goNext : validateCurrent, !checked && canCheck, locale)}</div>

          {checked && currentResult ? (
            <div className={`mt-6 rounded-[24px] px-4 py-4 text-base font-bold ${currentResult.correct ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>
              <p className="m-0">
                {currentResult.correct
                  ? locale === "it" ? "Bravissimo! Risposta corretta." : "Great job! Correct answer."
                  : locale === "it" ? "Riproviamo leggendo bene la spiegazione." : "Let's try again after reading the explanation carefully."}
              </p>
              <p className="mt-2 mb-0">{exerciseExplanation}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {!checked ? (
            <button type="button" className="cta-primary w-full border-0 sm:w-auto" onClick={validateCurrent} disabled={!canCheck}>
              {locale === "it" ? "Controlla" : "Check"}
            </button>
          ) : (
            <button type="button" className="cta-primary w-full border-0 sm:w-auto" onClick={goNext}>
              {index === sessionExercises.length - 1
                ? locale === "it" ? "Vai ai risultati" : "Go to results"
                : locale === "it" ? "Prossimo esercizio" : "Next exercise"}
            </button>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-4 sm:p-5">
          <h2 className="section-title m-0 text-2xl font-black text-slate-900 sm:text-3xl">{locale === "it" ? "Metodo" : "Method"}</h2>
          <div className="mt-4 space-y-3">
            {methodSteps.map((step) => (
              <div key={step} className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 sm:text-base">
                {step}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[20px] border border-slate-100 bg-white px-4 py-4 shadow-sm">
            <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Suggerimento del momento" : "Current tip"}</p>
            <p className="mt-2 mb-0 text-sm font-bold leading-6 text-slate-700 sm:text-base sm:leading-7">{pedagogicalTip}</p>
          </div>
        </div>
        <div className="soft-card p-5">
          <h3 className="m-0 text-xl font-black text-slate-900">{locale === "it" ? "Progressi" : "Progress"}</h3>
          <p className="mt-3 mb-0 text-sm font-bold text-slate-700 sm:text-base">
            {locale === "it" ? "Corrette finora" : "Correct so far"}: {correctCount} {locale === "it" ? "su" : "of"} {sessionExercises.length}
          </p>
          <p className="mt-2 mb-0 text-sm font-bold text-slate-700 sm:text-base">{locale === "it" ? "Risposte completate" : "Completed answers"}: {results.length}</p>
          <p className="mt-2 mb-0 text-sm font-bold text-slate-700 sm:text-base">
            {locale === "it" ? "Mancano ancora" : "Still remaining"}: {remainingExercises < 0 ? 0 : remainingExercises}
          </p>
        </div>
        <div className="rounded-[28px] border border-white/50 bg-white/75 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.07)] backdrop-blur">
          <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Obiettivo della sessione" : "Session goal"}</p>
          <p className="mt-3 mb-0 text-base font-black leading-7 text-slate-900 sm:text-lg sm:leading-8">
            {mode === "adaptive"
              ? locale === "it" ? adaptiveProfile.helper : adaptiveHelperText(adaptiveProfile.label)
              : locale === "it"
                ? "Arriva almeno a 2 stelle per consolidare questo argomento e costruire sicurezza nel ragionamento."
                : "Reach at least 2 stars to strengthen this topic and build confidence in reasoning."}
          </p>
          <p className="mt-3 mb-0 text-sm font-bold leading-6 text-slate-600 sm:leading-7">
            {getAdaptiveNarrative(topicHistory, locale)}
          </p>
          <p className="mt-3 mb-0 text-sm font-bold leading-6 text-slate-600 sm:leading-7">
            {locale === "it"
              ? `Arco della sessione: ${sessionArc.byStage.Concrete} concreti, ${sessionArc.byStage.Pittorico} pittorici, ${sessionArc.byStage.Astratto} astratti.`
              : `Session arc: ${sessionArc.byStage.Concrete} concrete, ${sessionArc.byStage.Pittorico} pictorial, ${sessionArc.byStage.Astratto} abstract.`}
          </p>
        </div>
      </aside>
    </div>
  );
}

function renderAnswerArea(
  exercise: Exercise,
  options: string[] | undefined,
  answer: AnswerValue,
  onChange: (value: AnswerValue) => void,
  onSubmit: () => void,
  canSubmit: boolean,
  locale: Locale,
) {
  if (exercise.type === "multiple-choice" || exercise.type === "bar-model") {
    return (
      <div className="grid gap-3">
        {options?.map((option, optionIndex) => {
          const answerValue = exercise.options?.[optionIndex] ?? option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(answerValue)}
              className={`rounded-[22px] border px-4 py-4 text-left text-base font-black sm:text-lg ${answer === answerValue ? "border-transparent bg-[var(--secondary)] text-white" : "border-slate-200 bg-white text-slate-800"}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <label className="block">
      <span className="mb-3 block text-sm font-black text-slate-700 sm:text-base">{locale === "it" ? "Scrivi la risposta" : "Write the answer"}</span>
      <input
        type="text"
        inputMode="numeric"
        value={answer}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && canSubmit) {
            onSubmit();
          }
        }}
        className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-xl font-black text-slate-900 sm:text-2xl"
        placeholder={locale === "it" ? "Es. 12" : "E.g. 12"}
      />
    </label>
  );
}

function labelForDifficultyFilter(value: DifficultyFilter, locale: Locale) {
  if (value === "all") return difficultyLabel("all", locale);
  return `${locale === "it" ? "focus" : "focus"} ${difficultyLabel(value, locale)}`;
}

function labelForMode(mode: SessionMode, locale: Locale) {
  if (locale === "en") return mode === "adaptive" ? "adaptive path" : "balanced path";
  return mode === "adaptive" ? "percorso adattivo" : "percorso bilanciato";
}

function adaptiveHelperText(level: string) {
  if (level === "rinforzo") return "More concrete support and fewer abstract steps so the key ideas become solid first.";
  if (level === "sfida") return "Less review and more room for problems, bar models and advanced strategies.";
  if (level === "equilibrato") return "We begin with an orderly progression: secure basics, visual models and final calculation.";
  return "A steady progression with short review, clear representation and one sustainable challenge.";
}

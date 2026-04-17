"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GradeStartPanel } from "@/components/GradeStartPanel";
import { grades } from "@/data/grades";
import { topicsByGrade } from "@/data/topics";
import { avatarLabel, getAvatarOption } from "@/lib/avatars";
import { getAuthSession } from "@/lib/auth";
import { getLocale, gradeLabel, topicDescription, topicLabel, uiText, type Locale } from "@/lib/i18n";
import { getProgress, setCurrentGrade } from "@/lib/progress";
import type { AuthSession, Grade, SavedProgress } from "@/lib/types";

export function HomePageShell({
  totalExercises,
  totalTopics,
}: {
  totalExercises: number;
  totalTopics: number;
}) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [progress, setProgress] = useState<SavedProgress | null>(null);
  const [locale, setLocaleState] = useState<Locale>("it");

  useEffect(() => {
    setLocaleState(getLocale());
    setSession(getAuthSession() ?? null);
    setProgress(getProgress());
  }, []);

  if (!session || !progress) {
    return <PublicHome totalExercises={totalExercises} totalTopics={totalTopics} locale={locale} />;
  }

  return (
    <LearnerDashboard
      session={session}
      progress={progress}
      totalExercises={totalExercises}
      totalTopics={totalTopics}
      locale={locale}
    />
  );
}

function PublicHome({ totalExercises, totalTopics, locale }: { totalExercises: number; totalTopics: number; locale: Locale }) {
  const t = uiText[locale];
  const featureCards =
    locale === "it"
      ? [
          ["Ragionamento visivo", "I bambini lavorano con immagini, confronti e strutture semplici prima di passare al calcolo."],
          ["Sessioni brevi", "Ogni sessione propone pochi esercizi ben scelti, così l'attenzione resta alta e il lavoro è sostenibile."],
          ["Feedback immediato", "Dopo ogni risposta arriva una spiegazione breve, positiva e utile per correggere il metodo."],
          ["Progressi salvati", "Stelle, badge e serie aiutano a vedere i passi avanti anche in una semplice sessione locale."],
        ]
      : [
          ["Visual reasoning", "Children work with images, comparisons and simple structures before moving to calculation."],
          ["Short sessions", "Each session offers a few carefully chosen exercises so attention stays high and practice remains sustainable."],
          ["Immediate feedback", "After each answer, children receive a short, positive explanation that helps correct the strategy."],
          ["Saved progress", "Stars, badges and streaks make progress visible even in a simple local session."],
        ];
  const growthItems =
    locale === "it"
      ? [
          "Banca esercizi ampliabile senza cambiare le pagine",
          "Persistenza locale semplice e chiara",
          "Accesso demo già pronto per la fase pilota",
          "Struttura compatibile con futuro backend",
          "Dashboard già pensata per genitori e docenti",
        ]
      : [
          "Exercise bank expandable without changing the pages",
          "Simple and transparent local persistence",
          "Demo access ready for the pilot phase",
          "Structure ready for a future backend",
          "Dashboard already designed for parents and teachers",
        ];

  return (
    <div className="space-y-8 px-2 py-4 md:space-y-10">
      <section className="relative overflow-hidden rounded-[38px] border border-white/55 bg-white/70 px-6 py-8 shadow-[0_25px_90px_rgba(15,23,42,0.08)] backdrop-blur md:px-8 md:py-10">
        <div className="absolute -top-20 right-8 h-44 w-44 rounded-full bg-fuchsia-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-black text-slate-900 shadow-sm">
              {t.publicBadge}
            </div>
            <h1 className="section-title mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              {t.publicTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-slate-600">
              {t.publicDescription}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <HomeStat label={t.classes} value={String(grades.length)} tone="from-orange-400 to-amber-300" />
              <HomeStat label={t.topics} value={String(totalTopics)} tone="from-cyan-400 to-blue-400" />
              <HomeStat label={t.exercises} value={String(totalExercises)} tone="from-fuchsia-500 to-violet-500" />
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="w-full rounded-[34px] bg-gradient-to-br from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-[0_24px_90px_rgba(76,29,149,0.22)]">
              <div className="rounded-[33px] bg-white/95 p-5">
                <div className="flex items-center justify-between">
                  <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.activePath}</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{t.children}</span>
                </div>
                <div className="mt-5 space-y-4">
                  <StepCard title={t.concrete} text={t.concreteText} />
                  <StepCard title={t.pictorial} text={t.pictorialText} />
                  <StepCard title={t.abstract} text={t.abstractText} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6 md:p-8">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.whyWorks}</p>
          <h2 className="section-title mt-3 text-4xl font-black text-slate-900">{t.clearLearning}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {featureCards.map(([title, description]) => (
              <FeatureCard key={title} title={title} description={description} />
            ))}
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.readyToGrow}</p>
          <h2 className="section-title mt-3 text-4xl font-black text-slate-900">{t.phaseTwoBase}</h2>
          <div className="mt-6 space-y-4">
            {growthItems.map((item) => (
              <div key={item} className="rounded-[24px] bg-slate-50 px-4 py-4 text-base font-black text-slate-800">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function LearnerDashboard({
  session,
  progress,
  totalExercises,
  totalTopics,
  locale,
}: {
  session: AuthSession;
  progress: SavedProgress;
  totalExercises: number;
  totalTopics: number;
  locale: Locale;
}) {
  const activeGrade = progress.currentGrade ?? session.learnerGrade;
  const activeGradeProgress = progress.byGrade[activeGrade];
  const t = uiText[locale];
  const accuracy = progress.totalExercises === 0 ? 0 : Math.round((progress.totalCorrect / progress.totalExercises) * 100);
  const activeAccuracy =
    activeGradeProgress.totalExercises === 0
      ? 0
      : Math.round((activeGradeProgress.totalCorrect / activeGradeProgress.totalExercises) * 100);

  const status = useMemo(() => {
    if (progress.totalSessions === 0) {
      return {
        title: locale === "it" ? "Percorso da avviare" : "Path ready to start",
        description:
          locale === "it"
            ? "Hai appena aperto il tuo spazio. Il primo obiettivo è iniziare con una sessione breve e prendere confidenza."
            : "You have just opened your space. The first goal is to start with a short session and get familiar with the method.",
      };
    }

    if (activeAccuracy >= 85 && activeGradeProgress.bestStars >= 3) {
      return {
        title: locale === "it" ? "Pronta per avanzare" : "Ready to move forward",
        description:
          locale === "it"
            ? "Stai lavorando con sicurezza. Possiamo consolidare l'argomento attivo e poi aprire nuove sfide."
            : "You are working with confidence. We can strengthen the active topic and then open new challenges.",
      };
    }

    if (activeAccuracy >= 65) {
      return {
        title: locale === "it" ? "Percorso in consolidamento" : "Path in consolidation",
        description:
          locale === "it"
            ? "Le basi stanno diventando solide. Vale la pena continuare con continuità per trasformare i successi in abitudine."
            : "The foundations are becoming solid. Keep practising regularly so success becomes a habit.",
      };
    }

    return {
      title: locale === "it" ? "Percorso in crescita" : "Growing path",
      description:
        locale === "it"
          ? "Stiamo costruendo passo dopo passo il metodo. Meglio lavorare con sessioni brevi e frequenti."
          : "We are building the method step by step. Short, frequent sessions are the best choice.",
    };
  }, [activeAccuracy, activeGradeProgress.bestStars, progress.totalSessions, locale]);

  const nextActionHref = `/classe/${activeGrade}`;
  const latestActivity = progress.history[0];
  const activeTopics = topicsByGrade[activeGrade];
  const completedTopicSet = new Set(activeGradeProgress.recentTopics);
  const recommendedTopics = [
    ...activeTopics.filter((topic) => !completedTopicSet.has(topic.slug)),
    ...activeTopics.filter((topic) => completedTopicSet.has(topic.slug)),
  ].slice(0, 5);
  const avatar = getAvatarOption(session.avatarId);

  return (
    <div className="space-y-8 px-2 py-4 md:space-y-10">
      <section className="relative overflow-hidden rounded-[38px] border border-white/55 bg-white/75 px-6 py-8 shadow-[0_25px_90px_rgba(15,23,42,0.08)] backdrop-blur md:px-8 md:py-10">
        <div className="absolute -top-16 left-8 h-40 w-40 rounded-full bg-amber-300/35 blur-3xl" />
        <div className="absolute bottom-0 right-8 h-44 w-44 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-black text-slate-900 shadow-sm">
              {t.personalDashboard}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <div className={`flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br ${avatar.gradient} text-5xl shadow-lg ring-4 ring-white`}>
                <span aria-hidden="true">{avatar.symbol}</span>
              </div>
              <h1 className="section-title m-0 max-w-2xl text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                {t.helloPrefix} {session.firstName}, {t.helloSuffix}
              </h1>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ProfileInfo label={t.fullName} value={session.fullName} />
              <ProfileInfo label={t.avatar} value={avatarLabel(avatar, locale)} />
              <ProfileInfo label={t.startingClass} value={gradeLabel(session.learnerGrade, locale)} />
              <ProfileInfo label={t.currentClass} value={gradeLabel(activeGrade, locale)} />
              <ProfileInfo label={t.pathStatus} value={status.title} />
            </div>
            <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-slate-600">{status.description}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={nextActionHref}
                onClick={() => setCurrentGrade(activeGrade)}
                className="cta-primary"
              >
                {t.continueIn} {labelForGradeShort(activeGrade, locale)}
              </Link>
              <Link href="/risultati" className="cta-secondary">
                {t.latestResults}
              </Link>
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="w-full rounded-[34px] bg-gradient-to-br from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-[0_24px_90px_rgba(76,29,149,0.22)]">
              <div className="rounded-[33px] bg-white/95 p-5">
                <div className="flex items-center justify-between">
                  <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.educationalStatus}</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                    {activeAccuracy}% {t.accuracy}
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  <StepCard
                    title={t.start}
                    text={progress.totalSessions === 0 ? t.firstAccessReady : `${progress.totalSessions} ${locale === "it" ? "sessioni completate" : "sessions completed"}`}
                  />
                  <StepCard title={t.consolidation} text={`${activeGradeProgress.bestStars} ${t.bestStars} ${labelForGradeShort(activeGrade, locale)}`} />
                  <StepCard
                    title={t.nextStep}
                    text={
                      activeGradeProgress.recentTopics[0]
                        ? `${locale === "it" ? "Riparti da" : "Restart from"} ${topicName(activeGradeProgress.recentTopics[0], activeGrade, locale)}`
                        : `${t.chooseTopic} ${labelForGradeShort(activeGrade, locale)}`
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HomeStat label={t.sessionsDone} value={String(progress.totalSessions)} tone="from-orange-400 to-amber-300" />
        <HomeStat label={t.averageAccuracy} value={`${accuracy}%`} tone="from-cyan-400 to-blue-400" />
        <HomeStat label={t.activeTopics} value={String(totalTopics)} tone="from-fuchsia-500 to-violet-500" />
        <HomeStat label={t.availableExercises} value={String(totalExercises)} tone="from-emerald-400 to-teal-400" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-6 md:p-8">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.educationPathStatus}</p>
          <h2 className="section-title mt-3 text-4xl font-black text-slate-900">{t.classVision}</h2>
          <div className="mt-6 space-y-4">
            {grades.map((grade) => {
              const item = progress.byGrade[grade.value];
              const itemAccuracy = item.totalExercises === 0 ? 0 : Math.round((item.totalCorrect / item.totalExercises) * 100);

              return (
                <div key={grade.value} className="rounded-[28px] bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="m-0 text-2xl font-black text-slate-900">{gradeLabel(grade.value, locale)}</h3>
                      <p className="mt-2 mb-0 text-base font-bold text-slate-600">{gradeSubtitle(grade.value, locale)}</p>
                    </div>
                    <span className="pill bg-white ring-1 ring-black/5">{gradeLabel(grade.value, locale)}</span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <MiniMetric label={locale === "it" ? "Sessioni" : "Sessions"} value={String(item.totalSessions)} />
                    <MiniMetric label={locale === "it" ? "Accuratezza" : "Accuracy"} value={`${itemAccuracy}%`} />
                    <MiniMetric label={locale === "it" ? "Migliori stelle" : "Best stars"} value={String(item.bestStars)} />
                  </div>
                  <p className="mt-4 mb-0 text-sm font-bold text-slate-600">
                    {locale === "it" ? "Argomenti recenti" : "Recent topics"}: {recentTopicList(item.recentTopics, grade.value, locale, locale === "it" ? "nessuna attività registrata" : "no activity recorded")}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-[34px] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-5 shadow-sm md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.pathwayMap}</p>
                <h3 className="section-title mt-2 text-3xl font-black text-slate-900">
                  {t.nextLessons} {gradeLabel(activeGrade, locale)}
                </h3>
              </div>
              <Link href={`/classe/${activeGrade}`} className="cta-secondary">
                {t.openPath}
              </Link>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {recommendedTopics.map((topic, index) => (
                <Link
                  key={topic.slug}
                  href={`/classe/${activeGrade}/argomento/${topic.slug}`}
                  className="group rounded-[24px] border border-white bg-white/85 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-sm font-black text-slate-900">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="m-0 text-lg font-black leading-6 text-slate-900">{topicLabel(topic.slug, topic.label, locale)}</h4>
                      <p className="mt-2 mb-0 text-sm font-bold leading-6 text-slate-600">{topicDescription(topic.slug, topic.description, locale)}</p>
                      <p className="mt-3 mb-0 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        {completedTopicSet.has(topic.slug) ? t.review : t.recommended}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 md:p-8">
            <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t.nextAction}</p>
            <h2 className="section-title mt-3 text-4xl font-black text-slate-900">{t.whatNow}</h2>
            <div className="mt-5 space-y-4">
              <FeatureCard
                title={locale === "it" ? "Continua la classe attiva" : "Continue the active class"}
                description={
                  locale === "it"
                    ? `Riparti da ${gradeLabel(activeGrade, locale)} e mantieni continuità sul percorso già iniziato.`
                    : `Restart from ${gradeLabel(activeGrade, locale)} and keep continuity with the path already started.`
                }
              />
              <FeatureCard
                title={locale === "it" ? "Conserva lo storico" : "Keep the history"}
                description={
                  locale === "it"
                    ? "Quando passerai a terza o quarta, la dashboard continuerà a mostrare anche il lavoro svolto negli anni precedenti."
                    : "When you move to third or fourth grade, the dashboard will still show the work completed in previous years."
                }
              />
              <FeatureCard
                title={locale === "it" ? "Leggi gli ultimi progressi" : "Read the latest progress"}
                description={
                  latestActivity
                    ? `${locale === "it" ? "Ultima attività" : "Latest activity"}: ${topicName(latestActivity.topic, latestActivity.grade, locale)} ${locale === "it" ? "con" : "with"} ${latestActivity.correct}/${latestActivity.total} ${locale === "it" ? "corrette" : "correct"}.`
                    : locale === "it"
                      ? "Lo storico comparirà dopo la prima sessione completata."
                      : "The history will appear after the first completed session."
                }
              />
            </div>
          </div>

          <GradeStartPanel compact locale={locale} />
        </div>
      </section>
    </div>
  );
}

function StepCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[24px] bg-slate-50 p-4">
      <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-2 mb-0 text-xl font-black text-slate-900">{text}</p>
    </div>
  );
}

function ProfileInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white/85 px-4 py-4 shadow-sm ring-1 ring-black/5">
      <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 mb-0 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-white px-4 py-4 shadow-sm ring-1 ring-black/5">
      <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 mb-0 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function HomeStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-[24px] bg-white/88 p-4 shadow-sm">
      <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${tone}`} />
      <p className="mt-3 mb-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 mb-0 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[26px] bg-slate-50 p-5">
      <h3 className="m-0 text-xl font-black text-slate-900">{title}</h3>
      <p className="mt-3 mb-0 text-base font-bold leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function labelForGradeShort(grade: Grade, locale: Locale) {
  if (locale === "en") {
    if (grade === "seconda") return "second grade";
    if (grade === "terza") return "third grade";
    return "fourth grade";
  }

  if (grade === "seconda") return "seconda";
  if (grade === "terza") return "terza";
  return "quarta";
}

function topicName(slug: string, grade: Grade, locale: Locale) {
  const topic = topicsByGrade[grade].find((item) => item.slug === slug);

  return topic ? topicLabel(topic.slug, topic.label, locale) : slug.replaceAll("-", " ");
}

function recentTopicList(topics: string[], grade: Grade, locale: Locale, emptyLabel: string) {
  if (topics.length === 0) return emptyLabel;

  return topics.map((topic) => topicName(topic, grade, locale)).join(", ");
}

function gradeSubtitle(grade: Grade, locale: Locale) {
  const subtitles = {
    it: {
      seconda: "Numeri, addizioni, sottrazioni, primi problemi",
      terza: "Moltiplicazioni, divisioni semplici, problemi a passi",
      quarta: "Problemi complessi, frazioni intuitive, bar model",
    },
    en: {
      seconda: "Numbers, additions, subtractions, first problems",
      terza: "Multiplication, simple division, multi-step problems",
      quarta: "Complex problems, intuitive fractions, bar models",
    },
  } as const;

  return subtitles[locale][grade];
}

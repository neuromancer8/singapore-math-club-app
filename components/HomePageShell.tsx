"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GradeStartPanel } from "@/components/GradeStartPanel";
import { grades } from "@/data/grades";
import { topicsByGrade } from "@/data/topics";
import { getAvatarOption } from "@/lib/avatars";
import { getAuthSession } from "@/lib/auth";
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

  useEffect(() => {
    setSession(getAuthSession() ?? null);
    setProgress(getProgress());
  }, []);

  if (!session || !progress) {
    return <PublicHome totalExercises={totalExercises} totalTopics={totalTopics} />;
  }

  return (
    <LearnerDashboard
      session={session}
      progress={progress}
      totalExercises={totalExercises}
      totalTopics={totalTopics}
    />
  );
}

function PublicHome({ totalExercises, totalTopics }: { totalExercises: number; totalTopics: number }) {
  return (
    <div className="space-y-8 px-2 py-4 md:space-y-10">
      <section className="relative overflow-hidden rounded-[38px] border border-white/55 bg-white/70 px-6 py-8 shadow-[0_25px_90px_rgba(15,23,42,0.08)] backdrop-blur md:px-8 md:py-10">
        <div className="absolute -top-20 right-8 h-44 w-44 rounded-full bg-fuchsia-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-black text-slate-900 shadow-sm">
              Metodo Singapore Math per la primaria
            </div>
            <h1 className="section-title mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              Imparare la matematica con immagini, logica e piccoli passi sicuri.
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-slate-600">
              Ogni attività unisce numero, ragionamento visivo, bar model e problem solving con un ritmo adatto ai bambini.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <HomeStat label="Classi" value={String(grades.length)} tone="from-orange-400 to-amber-300" />
              <HomeStat label="Argomenti" value={String(totalTopics)} tone="from-cyan-400 to-blue-400" />
              <HomeStat label="Esercizi" value={String(totalExercises)} tone="from-fuchsia-500 to-violet-500" />
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="w-full rounded-[34px] bg-gradient-to-br from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-[0_24px_90px_rgba(76,29,149,0.22)]">
              <div className="rounded-[33px] bg-white/95 p-5">
                <div className="flex items-center justify-between">
                  <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Percorso attivo</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Bambini</span>
                </div>
                <div className="mt-5 space-y-4">
                  <StepCard title="Concrete" text="Conta, confronta, costruisci" />
                  <StepCard title="Pittorico" text="Disegna barre, gruppi e parti" />
                  <StepCard title="Astratto" text="Risolvi, spiega e controlla" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6 md:p-8">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Perché funziona</p>
          <h2 className="section-title mt-3 text-4xl font-black text-slate-900">Un apprendimento chiaro e rassicurante</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FeatureCard title="Ragionamento visivo" description="I bambini lavorano con immagini, confronti e strutture semplici prima di passare al calcolo." />
            <FeatureCard title="Sessioni brevi" description="Ogni sessione propone pochi esercizi ben scelti, così l’attenzione resta alta e il lavoro è sostenibile." />
            <FeatureCard title="Feedback immediato" description="Dopo ogni risposta arriva una spiegazione breve, positiva e utile per correggere il metodo." />
            <FeatureCard title="Progressi salvati" description="Stelle, badge e serie aiutano a vedere i passi avanti anche in una semplice sessione locale." />
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Pronto per crescere</p>
          <h2 className="section-title mt-3 text-4xl font-black text-slate-900">Base solida per la fase 2</h2>
          <div className="mt-6 space-y-4">
            {[
              "Banca esercizi ampliabile senza cambiare le pagine",
              "Persistenza locale semplice e chiara",
              "Accesso demo già pronto per la fase pilota",
              "Struttura compatibile con futuro backend",
              "Dashboard già pensata per genitori e docenti",
            ].map((item) => (
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
}: {
  session: AuthSession;
  progress: SavedProgress;
  totalExercises: number;
  totalTopics: number;
}) {
  const activeGrade = progress.currentGrade ?? session.learnerGrade;
  const activeGradeMeta = grades.find((grade) => grade.value === activeGrade) ?? grades[0];
  const activeGradeProgress = progress.byGrade[activeGrade];
  const accuracy = progress.totalExercises === 0 ? 0 : Math.round((progress.totalCorrect / progress.totalExercises) * 100);
  const activeAccuracy =
    activeGradeProgress.totalExercises === 0
      ? 0
      : Math.round((activeGradeProgress.totalCorrect / activeGradeProgress.totalExercises) * 100);

  const status = useMemo(() => {
    if (progress.totalSessions === 0) {
      return {
        title: "Percorso da avviare",
        description: "Hai appena aperto il tuo spazio. Il primo obiettivo è iniziare con una sessione breve e prendere confidenza.",
      };
    }

    if (activeAccuracy >= 85 && activeGradeProgress.bestStars >= 3) {
      return {
        title: "Pronta per avanzare",
        description: "Stai lavorando con sicurezza. Possiamo consolidare l'argomento attivo e poi aprire nuove sfide.",
      };
    }

    if (activeAccuracy >= 65) {
      return {
        title: "Percorso in consolidamento",
        description: "Le basi stanno diventando solide. Vale la pena continuare con continuità per trasformare i successi in abitudine.",
      };
    }

    return {
      title: "Percorso in crescita",
      description: "Stiamo costruendo passo dopo passo il metodo. Meglio lavorare con sessioni brevi e frequenti.",
    };
  }, [activeAccuracy, activeGradeProgress.bestStars, progress.totalSessions]);

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
              Dashboard personale
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <div className={`flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br ${avatar.gradient} text-5xl shadow-lg ring-4 ring-white`}>
                <span aria-hidden="true">{avatar.symbol}</span>
              </div>
              <h1 className="section-title m-0 max-w-2xl text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                Ciao {session.firstName}, questo e il tuo percorso.
              </h1>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ProfileInfo label="Nome e cognome" value={session.fullName} />
              <ProfileInfo label="Avatar" value={avatar.label} />
              <ProfileInfo label="Classe di partenza" value={labelForGrade(session.learnerGrade)} />
              <ProfileInfo label="Classe attiva" value={labelForGrade(activeGrade)} />
              <ProfileInfo label="Stato del percorso" value={status.title} />
            </div>
            <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-slate-600">{status.description}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={nextActionHref}
                onClick={() => setCurrentGrade(activeGrade)}
                className="cta-primary"
              >
                Continua in {labelForGradeShort(activeGrade)}
              </Link>
              <Link href="/risultati" className="cta-secondary">
                Vedi ultimi risultati
              </Link>
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="w-full rounded-[34px] bg-gradient-to-br from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-[0_24px_90px_rgba(76,29,149,0.22)]">
              <div className="rounded-[33px] bg-white/95 p-5">
                <div className="flex items-center justify-between">
                  <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Stato educativo</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                    {activeAccuracy}% accuratezza
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  <StepCard title="Partenza" text={progress.totalSessions === 0 ? "Primo accesso pronto" : `${progress.totalSessions} sessioni completate`} />
                  <StepCard title="Consolidamento" text={`${activeGradeProgress.bestStars} stelle migliori in ${labelForGradeShort(activeGrade)}`} />
                  <StepCard
                    title="Prossimo passo"
                    text={
                      activeGradeProgress.recentTopics[0]
                        ? `Riparti da ${activeGradeProgress.recentTopics[0].replaceAll("-", " ")}`
                        : `Scegli un argomento di ${labelForGradeShort(activeGrade)}`
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <HomeStat label="Sessioni svolte" value={String(progress.totalSessions)} tone="from-orange-400 to-amber-300" />
        <HomeStat label="Accuratezza media" value={`${accuracy}%`} tone="from-cyan-400 to-blue-400" />
        <HomeStat label="Argomenti attivi" value={String(totalTopics)} tone="from-fuchsia-500 to-violet-500" />
        <HomeStat label="Esercizi disponibili" value={String(totalExercises)} tone="from-emerald-400 to-teal-400" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-6 md:p-8">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Stato del percorso educativo</p>
          <h2 className="section-title mt-3 text-4xl font-black text-slate-900">Visione per classe</h2>
          <div className="mt-6 space-y-4">
            {grades.map((grade) => {
              const item = progress.byGrade[grade.value];
              const itemAccuracy = item.totalExercises === 0 ? 0 : Math.round((item.totalCorrect / item.totalExercises) * 100);

              return (
                <div key={grade.value} className="rounded-[28px] bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="m-0 text-2xl font-black text-slate-900">{grade.title}</h3>
                      <p className="mt-2 mb-0 text-base font-bold text-slate-600">{grade.subtitle}</p>
                    </div>
                    <span className="pill bg-white ring-1 ring-black/5">{grade.value}</span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <MiniMetric label="Sessioni" value={String(item.totalSessions)} />
                    <MiniMetric label="Accuratezza" value={`${itemAccuracy}%`} />
                    <MiniMetric label="Migliori stelle" value={String(item.bestStars)} />
                  </div>
                  <p className="mt-4 mb-0 text-sm font-bold text-slate-600">
                    Argomenti recenti: {item.recentTopics.length > 0 ? item.recentTopics.join(", ") : "nessuna attività registrata"}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-[34px] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-5 shadow-sm md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Mappa del percorso</p>
                <h3 className="section-title mt-2 text-3xl font-black text-slate-900">
                  Prossime lezioni di {labelForGrade(activeGrade)}
                </h3>
              </div>
              <Link href={`/classe/${activeGrade}`} className="cta-secondary">
                Apri percorso
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
                      <h4 className="m-0 text-lg font-black leading-6 text-slate-900">{topic.label}</h4>
                      <p className="mt-2 mb-0 text-sm font-bold leading-6 text-slate-600">{topic.description}</p>
                      <p className="mt-3 mb-0 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        {completedTopicSet.has(topic.slug) ? "Da ripassare" : "Consigliato"}
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
            <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Prossima azione</p>
            <h2 className="section-title mt-3 text-4xl font-black text-slate-900">Cosa facciamo adesso</h2>
            <div className="mt-5 space-y-4">
              <FeatureCard
                title="Continua la classe attiva"
                description={`Riparti da ${labelForGrade(activeGrade)} e mantieni continuità sul percorso già iniziato.`}
              />
              <FeatureCard
                title="Conserva lo storico"
                description="Quando passerai a terza o quarta, la dashboard continuerà a mostrare anche il lavoro svolto negli anni precedenti."
              />
              <FeatureCard
                title="Leggi gli ultimi progressi"
                description={
                  latestActivity
                    ? `Ultima attività: ${latestActivity.topic.replaceAll("-", " ")} con ${latestActivity.correct}/${latestActivity.total} corrette.`
                    : "Lo storico comparirà dopo la prima sessione completata."
                }
              />
            </div>
          </div>

          <GradeStartPanel compact />
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

function labelForGrade(grade: Grade) {
  if (grade === "seconda") return "Seconda elementare";
  if (grade === "terza") return "Terza elementare";
  return "Quarta elementare";
}

function labelForGradeShort(grade: Grade) {
  if (grade === "seconda") return "seconda";
  if (grade === "terza") return "terza";
  return "quarta";
}

import Link from "next/link";
import { grades } from "@/data/grades";
import { GradeCard } from "@/components/GradeCard";
import { getExercisesByGrade } from "@/lib/exercises";

export default function HomePage() {
  const totalExercises = grades.reduce((sum, grade) => sum + getExercisesByGrade(grade.value).length, 0);
  const totalTopics = 9;

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
            <h1 className="section-title mt-5 max-w-3xl text-5xl font-black leading-none text-slate-900 md:text-6xl">
              Imparare la matematica con immagini, logica e piccoli passi sicuri.
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-slate-600">
              Un&apos;app in italiano per seconda, terza e quarta elementare. Ogni attività unisce numero,
              ragionamento visivo, bar model e problem solving con un ritmo adatto ai bambini.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/classe/seconda" className="cta-primary">
                Inizia dalla seconda
              </Link>
              <Link href="/genitori" className="cta-secondary">
                Vedi la dashboard
              </Link>
            </div>

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
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                    Bambini
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Concrete</p>
                    <p className="mt-2 mb-0 text-xl font-black text-slate-900">Conta, confronta, costruisci</p>
                  </div>
                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Pittorico</p>
                    <p className="mt-2 mb-0 text-xl font-black text-slate-900">Disegna barre, gruppi e parti</p>
                  </div>
                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <p className="m-0 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Astratto</p>
                    <p className="mt-2 mb-0 text-xl font-black text-slate-900">Risolvi, spiega e controlla</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {grades.map((grade) => (
          <GradeCard
            key={grade.value}
            grade={grade}
            totalExercises={getExercisesByGrade(grade.value).length}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6 md:p-8">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Perché funziona</p>
          <h2 className="section-title mt-3 text-4xl font-black text-slate-900">Un apprendimento chiaro e rassicurante</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FeatureCard
              title="Ragionamento visivo"
              description="I bambini lavorano con immagini, confronti e strutture semplici prima di passare al calcolo."
            />
            <FeatureCard
              title="Sessioni brevi"
              description="Ogni sessione propone pochi esercizi ben scelti, così l’attenzione resta alta e il lavoro è sostenibile."
            />
            <FeatureCard
              title="Feedback immediato"
              description="Dopo ogni risposta arriva una spiegazione breve, positiva e utile per correggere il metodo."
            />
            <FeatureCard
              title="Progressi salvati"
              description="Stelle, badge e serie aiutano a vedere i passi avanti anche in una semplice sessione locale."
            />
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Pronto per crescere</p>
          <h2 className="section-title mt-3 text-4xl font-black text-slate-900">Base solida per la fase 2</h2>
          <div className="mt-6 space-y-4">
            {[
              "Banca esercizi ampliabile senza cambiare le pagine",
              "Persistenza locale semplice e chiara",
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

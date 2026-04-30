import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const lockedBadges = {
  it: [
    ["🚀", "Sbloccato dopo 1 sessione"],
    ["🔥", "Sbloccato dopo 3 giorni di fila"],
    ["🎯", "Sbloccato con 80% di accuratezza"],
    ["⭐", "Sbloccato con una sessione perfetta"],
    ["🗺️", "Sbloccato provando tutte le classi"],
  ],
  en: [
    ["🚀", "Unlocked after 1 session"],
    ["🔥", "Unlocked after a 3-day streak"],
    ["🎯", "Unlocked with 80% accuracy"],
    ["⭐", "Unlocked with a perfect session"],
    ["🗺️", "Unlocked after trying all grades"],
  ],
} as const;

export function EmptyResults({ locale }: { locale: Locale }) {
  const badges = lockedBadges[locale];

  return (
    <div className="card overflow-hidden p-5 sm:p-6 md:p-8">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="pill bg-[var(--surface-soft)] text-slate-900">{locale === "it" ? "Primo accesso" : "First access"}</span>
          <div className="mt-5 text-6xl" aria-hidden="true">
            🦊
          </div>
          <h1 className="section-title mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
            {locale === "it" ? "Il tuo percorso sta per cominciare!" : "Your path is about to begin!"}
          </h1>
          <p className="mt-4 max-w-2xl text-base font-bold leading-7 text-slate-600 sm:text-lg sm:leading-8">
            {locale === "it"
              ? "Completa la tua prima sessione e qui vedrai stelle, badge e progressi. Ogni piccolo passo lascia una traccia utile."
              : "Complete your first session and you will see stars, badges and progress here. Every small step leaves a useful trace."}
          </p>
          <div className="mt-6">
            <Link href="/classe/seconda" className="cta-primary w-full text-center sm:w-auto">
              {locale === "it" ? "Inizia la prima sessione →" : "Start the first session →"}
            </Link>
          </div>
        </div>

        <div className="soft-card p-5">
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{locale === "it" ? "Badge bloccati" : "Locked badges"}</p>
          <h2 className="section-title mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
            {locale === "it" ? "Piccole missioni da sbloccare" : "Small missions to unlock"}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {badges.map(([icon, tooltip]) => (
              <div
                key={tooltip}
                className="rounded-[24px] border border-dashed border-slate-200 bg-white/80 p-4 text-center shadow-sm"
                title={tooltip}
                aria-label={tooltip}
              >
                <div className="text-4xl grayscale opacity-35" aria-hidden="true">
                  {icon}
                </div>
                <p className="mt-3 mb-0 text-xs font-black uppercase tracking-[0.14em] text-slate-400">???</p>
              </div>
            ))}
          </div>
          <p className="mt-5 mb-0 text-sm font-bold leading-6 text-slate-600">
            {locale === "it"
              ? "I badge diventano colorati quando il bambino completa le prime sfide."
              : "Badges become colourful when the child completes the first challenges."}
          </p>
        </div>
      </div>
    </div>
  );
}

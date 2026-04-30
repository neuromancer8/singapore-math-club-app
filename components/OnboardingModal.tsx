"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { ONBOARDING_DONE_KEY, OPEN_ONBOARDING_EVENT } from "@/lib/user-preferences";

const slides = {
  it: [
    {
      title: "Benvenuto nel Singapore Math Club 🦊",
      body: "Un percorso su misura per imparare la matematica con il metodo Singapore. Ogni sessione è breve, guidata passo dopo passo e pensata per non stancare.",
      visual: <NumberBlocks />,
    },
    {
      title: "Come funziona il metodo CPA?",
      body: "Iniziamo dal Concreto, passiamo al Pittorico con disegni e barre, poi arriviamo all'Astratto con numeri e calcoli. Così il cervello costruisce davvero il significato.",
      visual: <CpaVisual />,
    },
    {
      title: "Guadagna stelle e tieni il ritmo ⭐",
      body: "Dopo ogni sessione guadagni da 1 a 3 stelle. I genitori possono seguire i progressi e bastano pochi minuti al giorno per fare la differenza.",
      visual: <StarsVisual />,
    },
  ],
  en: [
    {
      title: "Welcome to Singapore Math Club 🦊",
      body: "A personalised path for learning math with the Singapore method. Each session is short, guided step by step and designed to keep practice light.",
      visual: <NumberBlocks />,
    },
    {
      title: "How does the CPA method work?",
      body: "We start with Concrete objects, move to Pictorial drawings and bars, and finally reach Abstract numbers and calculations. This helps children build real meaning.",
      visual: <CpaVisual />,
    },
    {
      title: "Earn stars and keep your rhythm ⭐",
      body: "After each session you earn 1 to 3 stars. Parents can follow progress, and just a few minutes a day can make a real difference.",
      visual: <StarsVisual />,
    },
  ],
} as const;

export function OnboardingModal({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const items = slides[locale];
  const current = items[index];
  const isLast = index === items.length - 1;

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setOpen(localStorage.getItem(ONBOARDING_DONE_KEY) === null);
    });

    const handleOpen = () => {
      setIndex(0);
      setOpen(true);
    };

    window.addEventListener(OPEN_ONBOARDING_EVENT, handleOpen);
    return () => {
      cancelled = true;
      window.removeEventListener(OPEN_ONBOARDING_EVENT, handleOpen);
    };
  }, []);

  if (!open) return null;

  function closeTutorial() {
    localStorage.setItem(ONBOARDING_DONE_KEY, "true");
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
      <div
        className="mx-auto min-w-0 overflow-x-hidden rounded-[34px] border border-white/65 bg-white/95 p-5 shadow-[0_30px_110px_rgba(15,23,42,0.2)] sm:p-7 md:p-8"
        style={{ boxSizing: "border-box", width: "calc(100vw - 2rem)", maxWidth: "48rem" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="pill bg-[var(--surface-soft)] text-slate-900">
              {locale === "it" ? `Passo ${index + 1} di ${items.length}` : `Step ${index + 1} of ${items.length}`}
            </span>
            <h2 id="onboarding-title" className="section-title mt-4 text-2xl font-black leading-tight break-words text-slate-900 sm:text-4xl">
              {current.title}
            </h2>
          </div>
          <button type="button" className="pill cursor-pointer border-0 bg-white ring-1 ring-black/5 shadow-sm" onClick={closeTutorial}>
            {locale === "it" ? "Salta" : "Skip"}
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="min-w-0">{current.visual}</div>
          <p className="m-0 min-w-0 text-base font-bold leading-7 text-slate-600 sm:text-lg sm:leading-8">{current.body}</p>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex justify-center gap-2 sm:justify-start">
            {items.map((item, dotIndex) => (
              <span
                key={item.title}
                className={`h-3 rounded-full transition-all ${dotIndex === index ? "w-9 bg-orange-500" : "w-3 bg-slate-200"}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="cta-secondary w-full border-0 sm:w-auto"
              onClick={() => setIndex((currentIndex) => Math.max(0, currentIndex - 1))}
              disabled={index === 0}
            >
              {locale === "it" ? "Indietro" : "Back"}
            </button>
            <button
              type="button"
              className="cta-primary w-full border-0 sm:w-auto"
              onClick={() => {
                if (isLast) {
                  closeTutorial();
                } else {
                  setIndex((currentIndex) => currentIndex + 1);
                }
              }}
            >
              {isLast ? (locale === "it" ? "Inizia" : "Start") : locale === "it" ? "Avanti" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberBlocks() {
  return (
    <div className="max-w-full overflow-hidden rounded-[30px] bg-gradient-to-br from-amber-100 via-white to-cyan-100 p-5 text-center shadow-inner">
      <div className="text-6xl" aria-hidden="true">
        🧒
      </div>
      <div className="mt-5 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-4">
        {[3, 7, 10, 4, 12, 8, 2, 6].map((number) => (
          <div key={number} className="min-w-0 rounded-2xl bg-white px-3 py-3 text-xl font-black text-slate-900 shadow-sm">
            {number}
          </div>
        ))}
      </div>
    </div>
  );
}

function CpaVisual() {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-[30px] bg-slate-50 p-4">
      {[
        ["🧱", "Concreto"],
        ["🖼️", "Pittorico"],
        ["🔢", "Astratto"],
      ].map(([icon, label]) => (
        <div key={label} className="rounded-[22px] bg-white px-3 py-5 text-center shadow-sm">
          <div className="text-4xl" aria-hidden="true">
            {icon}
          </div>
          <p className="mt-3 mb-0 text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

function StarsVisual() {
  return (
    <div className="rounded-[30px] bg-gradient-to-br from-violet-100 via-white to-amber-100 p-6 text-center">
      <div className="flex justify-center gap-3 text-5xl" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <span key={item} className="animate-pulse" style={{ animationDelay: `${item * 180}ms` }}>
            ⭐
          </span>
        ))}
      </div>
      <div className="mt-6 h-4 overflow-hidden rounded-full bg-white shadow-inner">
        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400" />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const CLASS_CODE_KEY = "classeCode";

export function TeacherModeCard({ locale }: { locale: Locale }) {
  const [code, setCode] = useState("");
  const [savedCode, setSavedCode] = useState("");

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      const stored = localStorage.getItem(CLASS_CODE_KEY) ?? "";
      setCode(stored);
      setSavedCode(stored);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function saveCode() {
    const cleaned = code.trim().toUpperCase();
    localStorage.setItem(CLASS_CODE_KEY, cleaned);
    setCode(cleaned);
    setSavedCode(cleaned);
  }

  return (
    <section className="rounded-[32px] border border-white/60 bg-white/78 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-cyan-100 text-3xl" aria-hidden="true">
          🏫
        </div>
        <div>
          <p className="m-0 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{locale === "it" ? "Modalità docente" : "Teacher mode"}</p>
          <h2 className="mt-2 mb-0 text-2xl font-black text-slate-900">{locale === "it" ? "Codice classe" : "Class code"}</h2>
          <p className="mt-3 mb-0 text-sm font-bold leading-6 text-slate-600">
            {locale === "it"
              ? "Funzione in arrivo: i docenti potranno vedere i progressi degli alunni collegati allo stesso codice classe."
              : "Coming soon: teachers will be able to see the progress of pupils linked to the same class code."}
          </p>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-slate-500">
          {locale === "it" ? "Inserisci codice classe" : "Enter class code"}
        </span>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="MATH2B-2026"
          className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-base font-black uppercase text-slate-900"
        />
      </label>
      <button type="button" className="cta-secondary mt-3 w-full border-0" onClick={saveCode}>
        {locale === "it" ? "Salva codice classe" : "Save class code"}
      </button>
      {savedCode ? (
        <p className="mt-3 mb-0 rounded-[20px] bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
          {locale === "it" ? "Codice salvato" : "Saved code"}: {savedCode}
        </p>
      ) : null}
      <div className="mt-4 rounded-[24px] bg-slate-50 p-4">
        <p className="m-0 text-base font-black text-slate-900">
          {locale === "it" ? "Prossimamente: dashboard docente multi-alunno" : "Coming soon: multi-pupil teacher dashboard"}
        </p>
      </div>
    </section>
  );
}

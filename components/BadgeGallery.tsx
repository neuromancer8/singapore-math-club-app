"use client";

import { useEffect, useMemo, useState } from "react";
import { BADGES, badgeCopy, isBadgeUnlocked } from "@/lib/badges";
import type { Locale } from "@/lib/i18n";
import type { SavedProgress } from "@/lib/types";
import { UNLOCKED_BADGES_KEY } from "@/lib/user-preferences";

export function BadgeGallery({ progress, locale }: { progress: SavedProgress; locale: Locale }) {
  const [storedBadges, setStoredBadges] = useState<string[]>([]);
  const unlocked = useMemo(() => Array.from(new Set([...progress.badges, ...storedBadges])), [progress.badges, storedBadges]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      const raw = localStorage.getItem(UNLOCKED_BADGES_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setStoredBadges(parsed.filter((item): item is string => typeof item === "string"));
        }
      } catch {
        setStoredBadges([]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [progress.badges]);

  return (
    <section className="card p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{locale === "it" ? "Gamification" : "Gamification"}</p>
          <h2 className="section-title mt-2 text-3xl font-black text-slate-900 sm:text-4xl">{locale === "it" ? "I tuoi badge" : "Your badges"}</h2>
        </div>
        <span className="pill bg-[var(--surface-soft)] text-slate-900">
          {unlocked.length}/{BADGES.length}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 md:grid-cols-6">
        {BADGES.map((badge) => {
          const copy = badgeCopy(badge.id, locale);
          const unlockedBadge = isBadgeUnlocked(badge.id, unlocked);

          return (
            <div
              key={badge.id}
              className={`rounded-[24px] border px-3 py-4 text-center shadow-sm transition ${
                unlockedBadge
                  ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white ring-2 ring-amber-100"
                  : "border-slate-100 bg-slate-50"
              }`}
              title={unlockedBadge ? copy.label : copy.condition}
            >
              <div className={`text-3xl ${unlockedBadge ? "" : "grayscale opacity-30"}`} aria-hidden="true">
                {badge.icon}
              </div>
              <p className={`mt-3 mb-0 text-xs font-black leading-4 ${unlockedBadge ? "text-slate-900" : "text-slate-400"}`}>
                {unlockedBadge ? copy.label : "???"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import type { SavedProgress, StoredSessionResult } from "@/lib/types";

const STORAGE_KEY = "singapore-math-progress";
const LAST_SESSION_KEY = "singapore-math-last-session";

const emptyProgress: SavedProgress = {
  totalSessions: 0,
  totalCorrect: 0,
  totalExercises: 0,
  streak: 0,
  badges: [],
};

export function getProgress(): SavedProgress {
  if (typeof window === "undefined") {
    return emptyProgress;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return emptyProgress;
  }

  try {
    return { ...emptyProgress, ...JSON.parse(raw) };
  } catch {
    return emptyProgress;
  }
}

export function saveProgress(progress: SavedProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function saveSessionResult(result: StoredSessionResult) {
  const current = getProgress();
  const next: SavedProgress = {
    totalSessions: current.totalSessions + 1,
    totalCorrect: current.totalCorrect + result.correct,
    totalExercises: current.totalExercises + result.total,
    streak: result.streak,
    badges: result.badgeUnlocked ? Array.from(new Set([...current.badges, result.badgeUnlocked])) : current.badges,
  };

  saveProgress(next);

  if (typeof window !== "undefined") {
    sessionStorage.setItem(LAST_SESSION_KEY, JSON.stringify(result));
  }

  return next;
}

export function getLastSession(): StoredSessionResult | undefined {
  if (typeof window === "undefined") return undefined;

  const raw = sessionStorage.getItem(LAST_SESSION_KEY);
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as StoredSessionResult;
  } catch {
    return undefined;
  }
}

"use client";

import type {
  Grade,
  GradeProgressSummary,
  SavedProgress,
  SessionHistoryItem,
  StoredSessionResult,
} from "@/lib/types";

const STORAGE_KEY = "singapore-math-progress";
const LAST_SESSION_KEY = "singapore-math-last-session";

function createEmptyGradeSummary(): GradeProgressSummary {
  return {
    totalSessions: 0,
    totalCorrect: 0,
    totalExercises: 0,
    bestStars: 0,
    recentTopics: [],
  };
}

function isGrade(value: unknown): value is Grade {
  return value === "seconda" || value === "terza" || value === "quarta";
}

function normalizeHistoryItem(value: unknown): SessionHistoryItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<SessionHistoryItem>;

  if (!isGrade(item.grade) || typeof item.topic !== "string") {
    return null;
  }

  return {
    id: typeof item.id === "string" ? item.id : `${item.grade}-${item.topic}-${Date.now()}`,
    grade: item.grade,
    topic: item.topic,
    total: typeof item.total === "number" ? item.total : 0,
    correct: typeof item.correct === "number" ? item.correct : 0,
    stars: typeof item.stars === "number" ? item.stars : 0,
    completedAt: typeof item.completedAt === "string" ? item.completedAt : new Date(0).toISOString(),
  };
}

function createEmptyByGrade(): Record<Grade, GradeProgressSummary> {
  return {
    seconda: createEmptyGradeSummary(),
    terza: createEmptyGradeSummary(),
    quarta: createEmptyGradeSummary(),
  };
}

const emptyProgress: SavedProgress = {
  totalSessions: 0,
  totalCorrect: 0,
  totalExercises: 0,
  streak: 0,
  badges: [],
  currentGrade: "seconda",
  byGrade: createEmptyByGrade(),
  history: [],
};

function normalizeGradeSummary(value?: Partial<GradeProgressSummary>): GradeProgressSummary {
  return {
    ...createEmptyGradeSummary(),
    ...value,
    totalSessions: typeof value?.totalSessions === "number" ? value.totalSessions : 0,
    totalCorrect: typeof value?.totalCorrect === "number" ? value.totalCorrect : 0,
    totalExercises: typeof value?.totalExercises === "number" ? value.totalExercises : 0,
    bestStars: typeof value?.bestStars === "number" ? value.bestStars : 0,
    lastPlayedAt: typeof value?.lastPlayedAt === "string" ? value.lastPlayedAt : undefined,
    recentTopics: Array.isArray(value?.recentTopics) ? value.recentTopics : [],
  };
}

function normalizeProgress(value?: Partial<SavedProgress>): SavedProgress {
  return {
    ...emptyProgress,
    ...value,
    byGrade: {
      seconda: normalizeGradeSummary(value?.byGrade?.seconda),
      terza: normalizeGradeSummary(value?.byGrade?.terza),
      quarta: normalizeGradeSummary(value?.byGrade?.quarta),
    },
    badges: Array.isArray(value?.badges) ? value.badges.filter((badge): badge is string => typeof badge === "string") : [],
    currentGrade: isGrade(value?.currentGrade) ? value.currentGrade : "seconda",
    history: Array.isArray(value?.history)
      ? value.history
          .map(normalizeHistoryItem)
          .filter((item): item is SessionHistoryItem => item !== null)
      : [],
  };
}

export function getProgress(): SavedProgress {
  if (typeof window === "undefined") {
    return emptyProgress;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return emptyProgress;
  }

  try {
    return normalizeProgress(JSON.parse(raw) as SavedProgress);
  } catch {
    return emptyProgress;
  }
}

export function saveProgress(progress: SavedProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function setCurrentGrade(grade: Grade) {
  const current = getProgress();
  const next = {
    ...current,
    currentGrade: grade,
  };

  saveProgress(next);

  return next;
}

export function saveSessionResult(result: StoredSessionResult) {
  const current = getProgress();
  const currentGradeSummary = current.byGrade[result.grade] ?? createEmptyGradeSummary();
  const nextHistoryEntry: SessionHistoryItem = {
    id: `${result.grade}-${result.topic}-${result.completedAt}`,
    grade: result.grade,
    topic: result.topic,
    total: result.total,
    correct: result.correct,
    stars: result.stars,
    completedAt: result.completedAt,
  };
  const nextRecentTopics = Array.from(new Set([result.topic, ...currentGradeSummary.recentTopics])).slice(0, 5);
  const next: SavedProgress = {
    totalSessions: current.totalSessions + 1,
    totalCorrect: current.totalCorrect + result.correct,
    totalExercises: current.totalExercises + result.total,
    streak: result.streak,
    badges: result.badgeUnlocked ? Array.from(new Set([...current.badges, result.badgeUnlocked])) : current.badges,
    currentGrade: result.grade,
    byGrade: {
      ...current.byGrade,
      [result.grade]: {
        totalSessions: currentGradeSummary.totalSessions + 1,
        totalCorrect: currentGradeSummary.totalCorrect + result.correct,
        totalExercises: currentGradeSummary.totalExercises + result.total,
        bestStars: Math.max(currentGradeSummary.bestStars, result.stars),
        lastPlayedAt: result.completedAt,
        recentTopics: nextRecentTopics,
      },
    },
    history: [nextHistoryEntry, ...current.history].slice(0, 40),
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

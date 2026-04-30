import type { Locale } from "@/lib/i18n";
import type { SavedProgress } from "@/lib/types";

export type BadgeId = "first_session" | "streak_3" | "accuracy_80" | "topic_complete" | "explorer" | "perfect_session";

export interface BadgeDefinition {
  id: BadgeId;
  icon: string;
  label: Record<Locale, string>;
  condition: Record<Locale, string>;
  legacyLabels?: string[];
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "first_session",
    icon: "🚀",
    label: { it: "Prima sessione", en: "First session" },
    condition: { it: "Completa 1 sessione", en: "Complete 1 session" },
    legacyLabels: ["Primo passo"],
  },
  {
    id: "streak_3",
    icon: "🔥",
    label: { it: "3 giorni di fila", en: "3-day streak" },
    condition: { it: "Allenati per 3 giorni consecutivi", en: "Practise for 3 days in a row" },
    legacyLabels: ["Costanza 3 giorni"],
  },
  {
    id: "accuracy_80",
    icon: "🎯",
    label: { it: "Precisione 80%", en: "80% accuracy" },
    condition: { it: "Raggiungi almeno 80% di accuratezza", en: "Reach at least 80% accuracy" },
    legacyLabels: ["Occhio matematico", "Due stelle"],
  },
  {
    id: "topic_complete",
    icon: "✅",
    label: { it: "Argomento completato", en: "Topic completed" },
    condition: { it: "Ottieni 3 stelle in un argomento", en: "Earn 3 stars in a topic" },
    legacyLabels: ["Tre stelle"],
  },
  {
    id: "explorer",
    icon: "🗺️",
    label: { it: "Esploratore", en: "Explorer" },
    condition: { it: "Prova almeno una sessione in tutte le classi", en: "Try at least one session in every grade" },
  },
  {
    id: "perfect_session",
    icon: "⭐",
    label: { it: "Sessione perfetta", en: "Perfect session" },
    condition: { it: "Rispondi correttamente a tutti gli esercizi", en: "Answer every exercise correctly" },
  },
];

export function badgeCopy(id: string, locale: Locale) {
  const badge = BADGES.find((item) => item.id === id || item.legacyLabels?.includes(id));
  if (!badge) return { label: id, condition: id };

  return {
    label: badge.label[locale],
    condition: badge.condition[locale],
  };
}

export function isBadgeUnlocked(id: BadgeId, unlockedBadges: string[]) {
  const badge = BADGES.find((item) => item.id === id);
  if (!badge) return false;

  return unlockedBadges.includes(id) || Boolean(badge.legacyLabels?.some((legacy) => unlockedBadges.includes(legacy)));
}

export function evaluateProgressBadges(progress: SavedProgress) {
  const badges = new Set<string>();
  const accuracy = progress.totalExercises === 0 ? 0 : Math.round((progress.totalCorrect / progress.totalExercises) * 100);
  const gradeSummaries = Object.values(progress.byGrade);

  if (progress.totalSessions >= 1) badges.add("first_session");
  if (progress.streak >= 3) badges.add("streak_3");
  if (accuracy >= 80) badges.add("accuracy_80");
  if (gradeSummaries.some((summary) => summary.bestStars >= 3)) badges.add("topic_complete");
  if (gradeSummaries.every((summary) => summary.totalSessions > 0)) badges.add("explorer");
  if (progress.history.some((item) => item.total > 0 && item.correct === item.total)) badges.add("perfect_session");

  return Array.from(badges);
}

export function awardBadges({
  existingBadges,
  stars,
  streak,
  correctAnswers,
  totalQuestions,
}: {
  existingBadges: string[];
  stars: number;
  streak: number;
  correctAnswers: number;
  totalQuestions?: number;
}) {
  const badges = new Set(existingBadges);
  const total = totalQuestions ?? 0;
  const accuracy = total > 0 ? correctAnswers / total : 0;

  badges.add("first_session");

  if (streak >= 3) badges.add("streak_3");
  if (stars === 3) badges.add("topic_complete");
  if (accuracy >= 0.8 || stars >= 2) badges.add("accuracy_80");
  if (total > 0 && correctAnswers === total) badges.add("perfect_session");

  return Array.from(badges);
}

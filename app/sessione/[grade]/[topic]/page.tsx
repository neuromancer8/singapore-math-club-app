import { notFound } from "next/navigation";
import { ExerciseCard } from "@/components/ExerciseCard";
import { getExercisesByTopic, getTopic, isGradeSlug } from "@/lib/exercises";
import type { DifficultyFilter, SessionMode } from "@/lib/types";

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ grade: string; topic: string }>;
  searchParams: Promise<{ difficulty?: string; mode?: string }>;
}) {
  const { grade, topic } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isGradeSlug(grade)) notFound();

  const topicMeta = getTopic(grade, topic);
  const exercises = getExercisesByTopic(grade, topic);
  const difficultyFilter = isDifficultyFilter(resolvedSearchParams.difficulty)
    ? resolvedSearchParams.difficulty
    : "all";
  const mode = isSessionMode(resolvedSearchParams.mode) ? resolvedSearchParams.mode : "standard";

  if (!topicMeta || exercises.length === 0) notFound();

  return (
    <ExerciseCard
      exercises={exercises}
      grade={grade}
      topic={topic}
      topicTitle={topicMeta.label}
      difficultyFilter={difficultyFilter}
      mode={mode}
    />
  );
}

function isDifficultyFilter(value?: string): value is DifficultyFilter {
  return value === "all" || value === "facile" || value === "media" || value === "avanzata";
}

function isSessionMode(value?: string): value is SessionMode {
  return value === "standard" || value === "adaptive";
}

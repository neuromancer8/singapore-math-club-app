import { notFound } from "next/navigation";
import { ExerciseCard } from "@/components/ExerciseCard";
import { getExercisesByTopic, getTopic, isGradeSlug } from "@/lib/exercises";
import { buildSessionExercises } from "@/lib/session";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ grade: string; topic: string }>;
}) {
  const { grade, topic } = await params;

  if (!isGradeSlug(grade)) notFound();

  const topicMeta = getTopic(grade, topic);
  const exercises = buildSessionExercises(getExercisesByTopic(grade, topic));

  if (!topicMeta || exercises.length === 0) notFound();

  return <ExerciseCard exercises={exercises} grade={grade} topic={topic} topicTitle={topicMeta.label} />;
}

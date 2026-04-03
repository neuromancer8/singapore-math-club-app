import type { Exercise } from "@/lib/types";

const SESSION_SIZE = 8;

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export function buildSessionExercises(exercises: Exercise[], desiredSize = SESSION_SIZE) {
  if (exercises.length <= desiredSize) {
    return exercises;
  }

  const byDifficulty = {
    easy: exercises.filter((exercise) => exercise.difficulty === 1),
    medium: exercises.filter((exercise) => exercise.difficulty === 2),
    hard: exercises.filter((exercise) => exercise.difficulty === 3),
  };

  const picked = [
    ...shuffle(byDifficulty.easy).slice(0, 3),
    ...shuffle(byDifficulty.medium).slice(0, 3),
    ...shuffle(byDifficulty.hard).slice(0, 2),
  ];

  const unique = Array.from(new Map(picked.map((exercise) => [exercise.id, exercise])).values());

  if (unique.length < desiredSize) {
    const filler = shuffle(exercises.filter((exercise) => !unique.some((item) => item.id === exercise.id))).slice(
      0,
      desiredSize - unique.length,
    );
    unique.push(...filler);
  }

  return shuffle(unique).slice(0, desiredSize);
}

export function getSessionSize() {
  return SESSION_SIZE;
}

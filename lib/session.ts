import type { DifficultyFilter, Exercise, SessionHistoryItem, SessionMode } from "@/lib/types";

const SESSION_SIZE = 8;

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function difficultyLabelToValue(filter: DifficultyFilter) {
  if (filter === "facile") return 1;
  if (filter === "media") return 2;
  if (filter === "avanzata") return 3;
  return undefined;
}

function groupByDifficulty(exercises: Exercise[]) {
  return {
    easy: exercises.filter((exercise) => exercise.difficulty === 1),
    medium: exercises.filter((exercise) => exercise.difficulty === 2),
    hard: exercises.filter((exercise) => exercise.difficulty === 3),
  };
}

function buildFromTargets(exercises: Exercise[], targets: { easy: number; medium: number; hard: number }, desiredSize: number) {
  const byDifficulty = groupByDifficulty(exercises);
  const picked = [
    ...shuffle(byDifficulty.easy).slice(0, targets.easy),
    ...shuffle(byDifficulty.medium).slice(0, targets.medium),
    ...shuffle(byDifficulty.hard).slice(0, targets.hard),
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

export function getAdaptiveProfile(history: SessionHistoryItem[]) {
  if (history.length === 0) {
    return {
      label: "equilibrato",
      helper: "Partiamo con un mix bilanciato per capire bene il livello.",
      targets: { easy: 3, medium: 3, hard: 2 },
    };
  }

  const accuracy =
    history.reduce((sum, item) => sum + item.correct / item.total, 0) / history.length;
  const averageStars = history.reduce((sum, item) => sum + item.stars, 0) / history.length;

  if (accuracy < 0.55 || averageStars < 1.5) {
    return {
      label: "rinforzo",
      helper: "Più esercizi facili e medi per consolidare i passaggi chiave.",
      targets: { easy: 4, medium: 3, hard: 1 },
    };
  }

  if (accuracy > 0.84 || averageStars >= 2.7) {
    return {
      label: "sfida",
      helper: "Più esercizi medi e avanzati per fare un passo in avanti.",
      targets: { easy: 1, medium: 3, hard: 4 },
    };
  }

  return {
    label: "progressione",
    helper: "Una progressione ordinata: un po' di ripasso e un po' di sfida.",
    targets: { easy: 2, medium: 4, hard: 2 },
  };
}

export function filterExercisesByDifficulty(exercises: Exercise[], difficultyFilter: DifficultyFilter) {
  const difficulty = difficultyLabelToValue(difficultyFilter);

  if (!difficulty) {
    return [...exercises].sort((left, right) => left.difficulty - right.difficulty);
  }

  const filtered = exercises.filter((exercise) => exercise.difficulty === difficulty);

  return filtered.length > 0 ? filtered : [...exercises].sort((left, right) => left.difficulty - right.difficulty);
}

export function buildSessionExercises({
  exercises,
  desiredSize = SESSION_SIZE,
  difficultyFilter = "all",
  mode = "standard",
  history = [],
}: {
  exercises: Exercise[];
  desiredSize?: number;
  difficultyFilter?: DifficultyFilter;
  mode?: SessionMode;
  history?: SessionHistoryItem[];
}) {
  const filtered = filterExercisesByDifficulty(exercises, difficultyFilter);

  if (filtered.length <= desiredSize) {
    return filtered;
  }

  if (difficultyFilter !== "all") {
    return shuffle(filtered).slice(0, desiredSize);
  }

  const profile =
    mode === "adaptive"
      ? getAdaptiveProfile(history)
      : {
          label: "equilibrato",
          helper: "Mix standard bilanciato.",
          targets: { easy: 3, medium: 3, hard: 2 },
        };

  return buildFromTargets(filtered, profile.targets, desiredSize);
}

export function getSessionSize() {
  return SESSION_SIZE;
}

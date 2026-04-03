function normalize(value: string | number | string[]) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim().toLowerCase()).join("|");
  }

  return String(value).trim().toLowerCase();
}

export function checkExerciseAnswer(userAnswer: string | string[], correctAnswer: string | number | string[]) {
  return normalize(userAnswer) === normalize(correctAnswer);
}

export function calculateStars(correct: number, total: number): number {
  const ratio = total === 0 ? 0 : correct / total;
  if (ratio === 1) return 3;
  if (ratio >= 0.7) return 2;
  if (ratio >= 0.4) return 1;
  return 0;
}

export function createSessionSummary(correct: number, total: number) {
  return {
    correct,
    total,
    stars: calculateStars(correct, total),
  };
}

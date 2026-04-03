export type Grade = "seconda" | "terza" | "quarta";

export type ExerciseType = "multiple-choice" | "numeric-input" | "word-problem" | "bar-model";

export interface GradeOption {
  value: Grade;
  title: string;
  subtitle: string;
}

export interface Topic {
  slug: string;
  label: string;
  description: string;
}

export interface TopicCatalogEntry extends Topic {
  grade: Grade;
  focus: string;
  cpaStage: "Concrete" | "Pittorico" | "Astratto";
}

export interface Exercise {
  id: string;
  grade: Grade;
  topic: string;
  type: ExerciseType;
  prompt: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: 1 | 2 | 3;
  visualModel?: string;
}

export interface SessionAnswer {
  exerciseId: string;
  correct: boolean;
  userAnswer: string;
}

export interface SessionResult {
  total: number;
  correct: number;
  stars: number;
  badgeUnlocked?: string;
}

export interface StoredSessionResult extends SessionResult {
  grade: Grade;
  topic: string;
  streak: number;
  completedAt: string;
  answers: SessionAnswer[];
}

export interface TopicProgress {
  attempts: number;
  totalCorrect: number;
  totalQuestions: number;
  bestStars: number;
  completedExerciseIds: string[];
  lastPlayedAt?: string;
}

export interface SavedProgress {
  totalSessions: number;
  totalCorrect: number;
  totalExercises: number;
  streak: number;
  badges: string[];
}

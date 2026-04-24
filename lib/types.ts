export type Grade = "seconda" | "terza" | "quarta";

export type ExerciseType = "multiple-choice" | "numeric-input" | "word-problem" | "bar-model";

export type DifficultyFilter = "all" | "facile" | "media" | "avanzata";

export type SessionMode = "standard" | "adaptive";

export type AvatarId =
  | "rocket"
  | "fox"
  | "owl"
  | "robot"
  | "turtle"
  | "lion"
  | "star"
  | "planet"
  | "pencil"
  | "whale"
  | "cat"
  | "unicorn";

export interface GradeOption {
  value: Grade;
  title: string;
  subtitle: string;
}

export interface Topic {
  slug: string;
  label: string;
  description: string;
  focus: string;
  focusEn: string;
  cpaStage: "Concrete" | "Pittorico" | "Astratto";
  goals: string[];
  goalsEn: string[];
}

export interface TopicCatalogEntry extends Topic {
  grade: Grade;
}

export interface Exercise {
  id: string;
  grade: Grade;
  topic: string;
  type: ExerciseType;
  prompt: string;
  promptEn?: string;
  options?: string[];
  optionsEn?: string[];
  correctAnswer: string | number;
  explanation: string;
  explanationEn?: string;
  difficulty: 1 | 2 | 3;
  visualModel?: string;
  visualModelEn?: string;
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

export interface AuthSession {
  userId: string;
  email: string;
  role: "admin" | "parent" | "teacher";
  loggedInAt: string;
  lastActivityAt: string;
  parentFirstName: string;
  parentLastName: string;
  parentFullName: string;
  activeLearnerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  learnerGrade: Grade;
  avatarId: AvatarId;
}

export interface SeedCredential {
  email: string;
  password: string;
  label: string;
}

export interface LearnerProfile {
  id: string;
  parentUserId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  learnerGrade: Grade;
  avatarId: AvatarId;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  session: AuthSession | null;
  profiles: LearnerProfile[];
  progress: SavedProgress | null;
}

export interface ParentRegistrationInput {
  parentFirstName: string;
  parentLastName: string;
  email: string;
  password: string;
  childFirstName: string;
  childLastName: string;
  childGrade: Grade;
  childAvatarId: AvatarId;
}

export interface SessionHistoryItem {
  id: string;
  grade: Grade;
  topic: string;
  total: number;
  correct: number;
  stars: number;
  completedAt: string;
}

export interface GradeProgressSummary {
  totalSessions: number;
  totalCorrect: number;
  totalExercises: number;
  bestStars: number;
  lastPlayedAt?: string;
  recentTopics: string[];
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
  currentGrade?: Grade;
  byGrade: Record<Grade, GradeProgressSummary>;
  history: SessionHistoryItem[];
}

import secondaExercises from "@/data/exercises-seconda.json";
import terzaExercises from "@/data/exercises-terza.json";
import quartaExercises from "@/data/exercises-quarta.json";
import { grades } from "@/data/grades";
import { topicsByGrade } from "@/data/topics";
import type { Exercise, Grade } from "@/lib/types";

const bank: Record<Grade, Exercise[]> = {
  seconda: secondaExercises as Exercise[],
  terza: terzaExercises as Exercise[],
  quarta: quartaExercises as Exercise[],
};

export function getGrades() {
  return grades;
}

export function getGrade(grade: string) {
  return grades.find((item) => item.value === grade);
}

export function getTopicsByGrade(grade: Grade) {
  return topicsByGrade[grade];
}

export function getTopic(grade: Grade, topic: string) {
  return topicsByGrade[grade].find((item) => item.slug === topic);
}

export function getExercisesByGrade(grade: Grade) {
  return bank[grade];
}

export function getExercisesByTopic(grade: Grade, topic: string) {
  return bank[grade].filter((exercise) => exercise.topic === topic);
}

export function isGradeSlug(value: string): value is Grade {
  return grades.some((grade) => grade.value === value);
}

import { HomePageShell } from "@/components/HomePageShell";
import { grades } from "@/data/grades";
import { getExercisesByGrade, getTopicsByGrade } from "@/lib/exercises";

export default function HomePage() {
  const totalExercises = grades.reduce((sum, grade) => sum + getExercisesByGrade(grade.value).length, 0);
  const totalTopics = grades.reduce((sum, grade) => sum + getTopicsByGrade(grade.value).length, 0);

  return <HomePageShell totalExercises={totalExercises} totalTopics={totalTopics} />;
}

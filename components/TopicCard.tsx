import Link from "next/link";
import type { Grade, Topic } from "@/lib/types";

export function TopicCard({
  grade,
  topic,
  totalExercises,
}: {
  grade: Grade;
  topic: Topic;
  totalExercises: number;
}) {
  return (
    <Link href={`/classe/${grade}/argomento/${topic.slug}`} className="card flex h-full flex-col gap-4 p-5 transition-transform hover:-translate-y-1">
      <div>
        <h3 className="m-0 text-2xl font-black text-slate-900">{topic.label}</h3>
        <p className="mt-2 text-base font-bold leading-7 text-slate-600">{topic.description}</p>
      </div>
      <div className="mt-auto rounded-[22px] bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-700">
        {totalExercises} attività disponibili
      </div>
    </Link>
  );
}

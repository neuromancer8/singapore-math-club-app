import Link from "next/link";
import { topicDescription, topicLabel, type Locale } from "@/lib/i18n";
import type { Grade, Topic } from "@/lib/types";

export function TopicCard({
  grade,
  topic,
  totalExercises,
  locale = "it",
}: {
  grade: Grade;
  topic: Topic;
  totalExercises: number;
  locale?: Locale;
}) {
  return (
    <Link href={`/classe/${grade}/argomento/${topic.slug}`} className="card flex h-full flex-col gap-4 p-5 transition-transform hover:-translate-y-1">
      <div>
        <h3 className="m-0 text-2xl font-black text-slate-900">{topicLabel(topic.slug, topic.label, locale)}</h3>
        <p className="mt-2 text-base font-bold leading-7 text-slate-600">{topicDescription(topic.slug, topic.description, locale)}</p>
      </div>
      <div className="mt-auto rounded-[22px] bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-700">
        {formatActivityLabel(totalExercises, locale)}
      </div>
    </Link>
  );
}

function formatActivityLabel(count: number, locale: Locale) {
  if (locale === "it") return `${count} ${count === 1 ? "attività disponibile" : "attività disponibili"}`;
  return `${count} ${count === 1 ? "activity available" : "activities available"}`;
}

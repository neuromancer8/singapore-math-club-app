import Link from "next/link";
import { notFound } from "next/navigation";
import { getExercisesByTopic, isGradeSlug } from "@/lib/exercises";
import { topicsByGrade } from "@/data/topics";
import { getServerLocale } from "@/lib/server-locale";
import { topicDescription, topicLabel } from "@/lib/i18n";
import type { Grade } from "@/lib/types";

export default async function GradePage({
  params,
}: {
  params: Promise<{ grade: Grade }>;
}) {
  const { grade } = await params;

  if (!isGradeSlug(grade)) notFound();

  const locale = await getServerLocale();
  const topics = topicsByGrade[grade] || [];

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">{locale === "it" ? "Scegli un argomento" : "Choose a topic"}</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic) => {
            const count = getExercisesByTopic(grade, topic.slug).length;

            return (
              <Link
                key={topic.slug}
                href={`/classe/${grade}/argomento/${topic.slug}`}
                className="rounded-3xl border p-5 shadow-sm hover:shadow-md"
              >
                <h2 className="text-xl font-semibold">{topicLabel(topic.slug, topic.label, locale)}</h2>
                <p className="mt-2 text-gray-600">{topicDescription(topic.slug, topic.description, locale)}</p>
                <p className="mt-4 text-sm font-semibold text-slate-500">
                  {count} {locale === "it" ? "esercizi disponibili" : "exercises available"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

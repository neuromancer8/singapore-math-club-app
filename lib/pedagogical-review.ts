import { topicsByGrade } from "@/data/topics";
import { getExercisesByTopic } from "@/lib/exercises";
import { getExerciseStage } from "@/lib/pedagogy";
import type { Grade } from "@/lib/types";

const topicPrerequisites: Record<Grade, Record<string, string[]>> = {
  seconda: {
    "decine-unita": ["numeri"],
    confronti: ["numeri", "decine-unita"],
    sequenze: ["numeri"],
    "addizione-sottrazione": ["numeri", "decine-unita"],
    "calcolo-mentale": ["addizione-sottrazione"],
    problemi: ["addizione-sottrazione"],
    "misure-semplici": ["numeri", "addizione-sottrazione"],
    "doppi-meta": ["numeri", "addizione-sottrazione"],
    "geometria-base": ["numeri"],
  },
  terza: {
    moltiplicazione: ["seconda:numeri", "seconda:addizione-sottrazione"],
    tabelline: ["moltiplicazione"],
    divisione: ["moltiplicazione", "tabelline"],
    "problemi-a-passi": ["moltiplicazione", "divisione"],
    "bar-model": ["problemi-a-passi"],
    misure: ["seconda:misure-semplici"],
    geometria: ["seconda:geometria-base"],
    "dati-e-logica": ["seconda:sequenze", "seconda:confronti"],
    "calcolo-scritto": ["seconda:addizione-sottrazione", "seconda:decine-unita"],
    "frazioni-base": ["seconda:doppi-meta"],
  },
  quarta: {
    "problemi-avanzati": ["terza:problemi-a-passi", "terza:calcolo-scritto"],
    frazioni: ["terza:frazioni-base", "terza:divisione"],
    "bar-model": ["terza:bar-model", "terza:problemi-a-passi"],
    "numeri-decimali": ["frazioni", "terza:misure"],
    equivalenze: ["terza:misure", "numeri-decimali"],
    "perimetro-area": ["terza:geometria", "equivalenze"],
    "dati-e-grafici": ["terza:dati-e-logica"],
    "problemi-con-frazioni": ["frazioni", "bar-model"],
    "operazioni-strategiche": ["problemi-avanzati", "terza:calcolo-scritto"],
  },
};

export type PedagogicalReviewItem = {
  grade: Grade;
  topic: string;
  label: string;
  prerequisites: string[];
  exerciseCount: number;
  difficultyCoverage: number[];
  cpaCoverage: string[];
  status: "ready" | "watch" | "needs-work";
  notes: string[];
};

export function buildPedagogicalReview(): PedagogicalReviewItem[] {
  return (Object.keys(topicsByGrade) as Grade[]).flatMap((grade) =>
    topicsByGrade[grade].map((topic) => {
      const exercises = getExercisesByTopic(grade, topic.slug);
      const difficultyCoverage = Array.from(new Set(exercises.map((exercise) => exercise.difficulty))).sort();
      const cpaCoverage = Array.from(new Set(exercises.map(getExerciseStage)));
      const prerequisites = topicPrerequisites[grade][topic.slug] ?? [];
      const notes: string[] = [];

      if (exercises.length < 6) notes.push("Aggiungere almeno 6 esercizi per sostenere una sessione adattiva.");
      if (difficultyCoverage.length < 3) notes.push("Manca almeno un livello di difficoltà.");
      if (topic.cpaStage !== "Astratto" && !cpaCoverage.includes(topic.cpaStage)) {
        notes.push(`Rafforzare la fase CPA ${topic.cpaStage} con esercizi coerenti.`);
      }
      if (topic.slug.includes("problemi") && !cpaCoverage.includes("Astratto")) {
        notes.push("Inserire problemi verbali con spiegazione esplicita dei passaggi.");
      }
      if (prerequisites.length === 0 && grade !== "seconda") {
        notes.push("Prerequisiti non dichiarati: controllare il ponte con il modulo precedente.");
      }

      return {
        grade,
        topic: topic.slug,
        label: topic.label,
        prerequisites,
        exerciseCount: exercises.length,
        difficultyCoverage,
        cpaCoverage,
        status: notes.length === 0 ? "ready" : notes.length <= 2 ? "watch" : "needs-work",
        notes,
      };
    }),
  );
}

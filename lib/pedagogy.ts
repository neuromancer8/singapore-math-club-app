import { topicsByGrade } from "@/data/topics";
import type { Exercise, Grade, SessionHistoryItem, Topic } from "@/lib/types";

const stageWeight = {
  Concrete: 0,
  Pittorico: 1,
  Astratto: 2,
} as const;

const typeStage = {
  "multiple-choice": "Concrete",
  "numeric-input": "Astratto",
  "word-problem": "Astratto",
  "bar-model": "Pittorico",
} as const;

export function getTopicEntry(grade: Grade, slug: string): Topic | undefined {
  return topicsByGrade[grade].find((topic) => topic.slug === slug);
}

export function getExerciseStage(exercise: Exercise) {
  return typeStage[exercise.type];
}

export function sortExercisesPedagogically(exercises: Exercise[]) {
  return [...exercises].sort((left, right) => {
    const difficultyGap = left.difficulty - right.difficulty;
    if (difficultyGap !== 0) return difficultyGap;

    const stageGap = stageWeight[getExerciseStage(left)] - stageWeight[getExerciseStage(right)];
    if (stageGap !== 0) return stageGap;

    return left.id.localeCompare(right.id);
  });
}

export function describeSessionArc(exercises: Exercise[]) {
  const ordered = sortExercisesPedagogically(exercises);
  const byStage = {
    Concrete: ordered.filter((exercise) => getExerciseStage(exercise) === "Concrete").length,
    Pittorico: ordered.filter((exercise) => getExerciseStage(exercise) === "Pittorico").length,
    Astratto: ordered.filter((exercise) => getExerciseStage(exercise) === "Astratto").length,
  };

  return {
    ordered,
    byStage,
    startsWith: ordered[0] ? getExerciseStage(ordered[0]) : "Concrete",
    endsWith: ordered[ordered.length - 1] ? getExerciseStage(ordered[ordered.length - 1]) : "Astratto",
  };
}

export function getPedagogicalTip(exercise: Exercise, locale: "it" | "en") {
  if (locale === "it") {
    if (exercise.type === "bar-model") return "Guarda prima le parti e il totale: il disegno ti dice già come ragionare.";
    if (exercise.type === "word-problem") return "Prima racconta il problema con parole tue, poi scegli l’operazione.";
    if (exercise.type === "numeric-input") return "Cerca un numero amico o una scomposizione comoda prima di calcolare.";
    return "Osserva bene tutte le opzioni e giustifica la tua scelta con un confronto chiaro.";
  }

  if (exercise.type === "bar-model") return "Look at the parts and the whole first: the drawing already suggests the strategy.";
  if (exercise.type === "word-problem") return "Retell the problem in your own words before choosing the operation.";
  if (exercise.type === "numeric-input") return "Look for a friendly number or a useful split before calculating.";
  return "Read all options carefully and justify your choice with a clear comparison.";
}

export function getPedagogicalSteps(locale: "it" | "en", cpaStage: Topic["cpaStage"]) {
  if (locale === "it") {
    return [
      "1. Parti dalla situazione concreta o dai dati chiave.",
      cpaStage === "Concrete" ? "2. Costruisci gruppi, quantità o confronti." : "2. Disegna o immagina il modello che rappresenta il problema.",
      "3. Passa al calcolo e controlla se la risposta ha senso.",
    ];
  }

  return [
    "1. Start from the concrete situation or the key data.",
    cpaStage === "Concrete" ? "2. Build groups, quantities or comparisons." : "2. Draw or imagine the model that represents the problem.",
    "3. Move to calculation and check whether the answer makes sense.",
  ];
}

export function getAdaptiveNarrative(history: SessionHistoryItem[], locale: "it" | "en") {
  if (history.length === 0) {
    return locale === "it"
      ? "Cominciamo con una progressione guidata: prima sicurezza, poi rappresentazione, infine calcolo."
      : "We start with a guided progression: first confidence, then representation, then calculation.";
  }

  const accuracy = history.reduce((sum, item) => sum + item.correct / item.total, 0) / history.length;
  const recentStars = history.slice(0, 3).reduce((sum, item) => sum + item.stars, 0) / Math.min(history.length, 3);

  if (accuracy < 0.6 || recentStars < 1.7) {
    return locale === "it"
      ? "Percorso di rinforzo: più ripasso iniziale e un solo passaggio davvero sfidante alla fine."
      : "Support path: more review at the start and just one truly challenging step at the end.";
  }

  if (accuracy > 0.86 && recentStars >= 2.5) {
    return locale === "it"
      ? "Percorso di avanzamento: basi rapide, più spazio a bar model, problemi e calcolo strategico."
      : "Advancement path: quick foundations, more room for bar models, problems and strategic calculation.";
  }

  return locale === "it"
    ? "Percorso di consolidamento: basi brevi, rappresentazione chiara e chiusura con una sfida sostenibile."
    : "Consolidation path: brief foundations, clear representation and a sustainable challenge at the end.";
}

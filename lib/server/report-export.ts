import { topicsByGrade } from "@/data/topics";
import { gradeLabel, topicLabel } from "@/lib/i18n";
import type { AuthSession, LearnerProgressSummary, SavedProgress } from "@/lib/types";

type ReportContext = {
  session: AuthSession;
  progress: SavedProgress;
  learners?: LearnerProgressSummary[];
};

function pct(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function topicName(slug: string, grade: string) {
  if (grade === "seconda" || grade === "terza" || grade === "quarta") {
    const topic = topicsByGrade[grade].find((item) => item.slug === slug);
    return topicLabel(slug, topic?.label ?? slug, "it");
  }
  return slug;
}

export function reportFileName(prefix: string, extension: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${prefix}-${stamp}.${extension}`;
}

export function buildProgressCsv({ session, progress, learners }: ReportContext) {
  const rows = [
    ["tipo", "alunno", "classe", "argomento", "sessioni", "esercizi", "corrette", "accuratezza", "stelle", "data"],
    ["totale", session.fullName, gradeLabel(session.learnerGrade, "it"), "", progress.totalSessions, progress.totalExercises, progress.totalCorrect, `${pct(progress.totalCorrect, progress.totalExercises)}%`, "", ""],
  ];

  for (const item of progress.history) {
    rows.push([
      "sessione",
      session.fullName,
      gradeLabel(item.grade, "it"),
      topicName(item.topic, item.grade),
      1,
      item.total,
      item.correct,
      `${pct(item.correct, item.total)}%`,
      item.stars,
      item.completedAt,
    ]);
  }

  for (const item of learners ?? []) {
    rows.push([
      "alunno",
      item.learner.fullName,
      gradeLabel(item.learner.learnerGrade, "it"),
      "",
      item.progress.totalSessions,
      item.progress.totalExercises,
      item.progress.totalCorrect,
      `${pct(item.progress.totalCorrect, item.progress.totalExercises)}%`,
      "",
      item.updatedAt ?? "",
    ]);
  }

  return rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
}

export function buildProgressWordHtml({ session, progress, learners }: ReportContext) {
  const rows = progress.history
    .slice(0, 20)
    .map(
      (item) => `
        <tr>
          <td>${new Date(item.completedAt).toLocaleDateString("it-IT")}</td>
          <td>${gradeLabel(item.grade, "it")}</td>
          <td>${topicName(item.topic, item.grade)}</td>
          <td>${item.correct}/${item.total}</td>
          <td>${item.stars}</td>
        </tr>`,
    )
    .join("");
  const learnerRows = (learners ?? [])
    .map(
      (item) => `
        <tr>
          <td>${item.learner.fullName}</td>
          <td>${gradeLabel(item.learner.learnerGrade, "it")}</td>
          <td>${item.progress.totalSessions}</td>
          <td>${item.progress.totalExercises}</td>
          <td>${pct(item.progress.totalCorrect, item.progress.totalExercises)}%</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Report Singapore Math Club</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; }
    h1 { color: #1d4ed8; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    th { background: #e0f2fe; }
  </style>
</head>
<body>
  <h1>Report Singapore Math Club</h1>
  <p><strong>Alunno:</strong> ${session.fullName}</p>
  <p><strong>Classe:</strong> ${gradeLabel(session.learnerGrade, "it")}</p>
  <p><strong>Sessioni:</strong> ${progress.totalSessions} | <strong>Esercizi:</strong> ${progress.totalExercises} | <strong>Accuratezza:</strong> ${pct(progress.totalCorrect, progress.totalExercises)}%</p>
  <h2>Storico recente</h2>
  <table>
    <thead><tr><th>Data</th><th>Classe</th><th>Argomento</th><th>Risultato</th><th>Stelle</th></tr></thead>
    <tbody>${rows || "<tr><td colspan=\"5\">Nessuna sessione completata.</td></tr>"}</tbody>
  </table>
  <h2>Vista multi-alunno</h2>
  <table>
    <thead><tr><th>Alunno</th><th>Classe</th><th>Sessioni</th><th>Esercizi</th><th>Accuratezza</th></tr></thead>
    <tbody>${learnerRows || "<tr><td colspan=\"5\">Nessun altro profilo disponibile.</td></tr>"}</tbody>
  </table>
</body>
</html>`;
}

function pdfEscape(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, " ")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

export function buildProgressPdf({ session, progress, learners }: ReportContext) {
  const lines = [
    "Singapore Math Club - Report progressi",
    `Alunno: ${session.fullName}`,
    `Classe: ${gradeLabel(session.learnerGrade, "it")}`,
    `Sessioni: ${progress.totalSessions}`,
    `Esercizi: ${progress.totalExercises}`,
    `Corrette: ${progress.totalCorrect}`,
    `Accuratezza: ${pct(progress.totalCorrect, progress.totalExercises)}%`,
    "",
    "Storico recente:",
    ...progress.history.slice(0, 12).map((item) => `${new Date(item.completedAt).toLocaleDateString("it-IT")} - ${gradeLabel(item.grade, "it")} - ${topicName(item.topic, item.grade)} - ${item.correct}/${item.total} - ${item.stars} stelle`),
    "",
    "Dashboard docente / multi-alunno:",
    ...((learners ?? []).slice(0, 18).map((item) => `${item.learner.fullName} - ${gradeLabel(item.learner.learnerGrade, "it")} - ${item.progress.totalSessions} sessioni - ${pct(item.progress.totalCorrect, item.progress.totalExercises)}%`) || []),
  ];
  const content = [
    "BT",
    "/F1 18 Tf",
    "50 790 Td",
    ...lines.flatMap((line, index) => [
      index === 0 ? "" : "0 -22 Td",
      `(${pdfEscape(line)}) Tj`,
    ]),
    "ET",
  ].filter(Boolean).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];
  for (let index = 0; index < objects.length; index++) {
    offsets.push(Buffer.byteLength(chunks.join("")));
    chunks.push(`${index + 1} 0 obj\n${objects[index]}\nendobj\n`);
  }
  const xrefOffset = Buffer.byteLength(chunks.join(""));
  chunks.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  for (const offset of offsets.slice(1)) {
    chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  }
  chunks.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);
  return Buffer.from(chunks.join(""));
}

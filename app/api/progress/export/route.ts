import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/server/current-session";
import { listLearnerProgressSummaries } from "@/lib/server/auth-store";
import { buildProgressCsv, buildProgressPdf, buildProgressWordHtml, reportFileName } from "@/lib/server/report-export";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const current = await getCurrentSession({ refresh: false });
  if (!current?.session || !current.progress) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "csv";
  const learners = await listLearnerProgressSummaries(current.session);

  if (format === "pdf") {
    return new Response(buildProgressPdf({ session: current.session, progress: current.progress, learners }), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${reportFileName("singapore-math-progressi", "pdf")}"`,
      },
    });
  }

  if (format === "word" || format === "doc") {
    return new Response(buildProgressWordHtml({ session: current.session, progress: current.progress, learners }), {
      headers: {
        "Content-Type": "application/msword; charset=utf-8",
        "Content-Disposition": `attachment; filename="${reportFileName("singapore-math-progressi", "doc")}"`,
      },
    });
  }

  return new Response(buildProgressCsv({ session: current.session, progress: current.progress, learners }), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${reportFileName("singapore-math-progressi", "csv")}"`,
    },
  });
}

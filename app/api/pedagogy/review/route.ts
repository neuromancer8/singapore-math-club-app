import { NextResponse } from "next/server";
import { buildPedagogicalReview } from "@/lib/pedagogical-review";

export async function GET() {
  const review = buildPedagogicalReview();
  return NextResponse.json({
    success: true,
    review,
    summary: {
      ready: review.filter((item) => item.status === "ready").length,
      watch: review.filter((item) => item.status === "watch").length,
      needsWork: review.filter((item) => item.status === "needs-work").length,
    },
  });
}

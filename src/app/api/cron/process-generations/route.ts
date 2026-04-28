import { NextResponse } from "next/server";
import { pollProcessingGenerations } from "@/lib/ai/results";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null;

  if (expected && auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await pollProcessingGenerations(10);
    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error("Cron processing error:", error);
    return NextResponse.json(
      { error: "Failed to process generations" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getProvider } from "@/lib/ai/registry";
import { processProviderResult } from "@/lib/ai/results";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("fal-webhook-signature") ?? "";
    const provider = getProvider("fal");

    if (!provider.verifyWebhook(rawBody, signature, request.headers)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const result = await provider.handleWebhook(body);

    const processed = await processProviderResult({
      provider: "fal",
      eventId: String(body.request_id ?? crypto.randomUUID()),
      eventType: String(body.status ?? "completed"),
      payload: body as Prisma.InputJsonObject,
      result,
    });

    return NextResponse.json({ received: true, ...processed });
  } catch (error) {
    console.error("fal webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGeneration } from "@/lib/ai/queue";

const CREEM_MODERATION_URL =
  process.env.CREEM_API_KEY?.startsWith("creem_test_")
    ? "https://test-api.creem.io/v1/moderation/prompt"
    : "https://api.creem.io/v1/moderation/prompt";

async function moderatePrompt(prompt: string, externalId: string): Promise<"allow" | "flag" | "deny"> {
  const res = await fetch(CREEM_MODERATION_URL, {
    method: "POST",
    headers: {
      "x-api-key": process.env.CREEM_API_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify({ prompt, external_id: externalId }),
  });

  if (!res.ok) return "allow"; // fail open only if moderation endpoint is down
  const data = await res.json();
  return data.decision || "allow";
}

// POST /api/generate — Create a generation task
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, model, prompt, negativePrompt, imageUrl, videoUrl, params } = body;

    if (!type || !model) {
      return NextResponse.json(
        { error: "Missing required fields: type, model" },
        { status: 400 }
      );
    }

    // Creem Content Moderation — screen prompt before generation
    if (prompt && process.env.CREEM_API_KEY) {
      const decision = await moderatePrompt(prompt, `user_${user.id}`);
      if (decision === "deny") {
        return NextResponse.json(
          { error: "Your prompt was rejected because it violates our content policy. Please revise and try again." },
          { status: 400 },
        );
      }
      if (decision === "flag") {
        return NextResponse.json(
          { error: "Your prompt could not be processed. Please revise and try again." },
          { status: 400 },
        );
      }
    }

    const result = await createGeneration({
      userId: user.id,
      type,
      modelSlug: model,
      prompt,
      negativePrompt,
      imageUrl,
      videoUrl,
      params: params ?? {},
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    const status = message === "INSUFFICIENT_CREDITS" ? 402
      : message === "CONCURRENCY_LIMIT" ? 429
      : message === "MODEL_NOT_FOUND" ? 404
      : message === "UNSUPPORTED_TYPE" ? 400
      : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

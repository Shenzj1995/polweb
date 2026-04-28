import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGeneration } from "@/lib/ai/queue";

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

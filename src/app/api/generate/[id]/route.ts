import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { createClient } from "@/lib/supabase/server";
import { createSignedDownloadUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const generation = await prisma.generation.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!generation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let downloadUrl: string | null = null;
    if (generation.status === "SUCCEEDED" && generation.outputUrl) {
      try {
        downloadUrl = await createSignedDownloadUrl(generation.outputUrl);
      } catch {
        downloadUrl = generation.outputUrl;
      }
    }

    return NextResponse.json({
      id: generation.id,
      status: generation.status,
      outputUrl: downloadUrl,
      outputType: generation.outputType,
      thumbnailUrl: generation.thumbnailUrl,
      errorCode: generation.errorCode,
      errorMessage: generation.errorMessage,
      completedAt: generation.completedAt,
      createdAt: generation.createdAt,
    });
  } catch (error) {
    console.error("Generation fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch generation" },
      { status: 500 }
    );
  }
}

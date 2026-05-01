import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { createClient } from "@/lib/supabase/server";
import { createSignedDownloadUrl } from "@/lib/storage";
import type { Prisma } from "@prisma/client";

// GET /api/user/assets — List user's assets
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
    const mediaType = searchParams.get("mediaType");

    const where: Prisma.AssetWhereInput = { userId: user.id };
    if (mediaType) where.mediaType = mediaType;

    const [items, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.asset.count({ where }),
    ]);

    const generationIds = items
      .map((asset) => asset.generationId)
      .filter((id): id is string => Boolean(id));
    const generations = generationIds.length
      ? await prisma.generation.findMany({
          where: {
            id: { in: generationIds },
            userId: user.id,
          },
          select: {
            id: true,
            prompt: true,
            model: true,
            type: true,
          },
        })
      : [];
    const generationsById = new Map(generations.map((generation) => [generation.id, generation]));

    // Generate signed URLs for each asset
    const itemsWithUrls = await Promise.all(
      items.map(async (asset) => {
        let url: string | null = null;
        try {
          url = await createSignedDownloadUrl(asset.storageKey, 60 * 30);
        } catch {
          url = asset.storageKey;
        }

        return {
          id: asset.id,
          kind: asset.kind,
          mediaType: asset.mediaType,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
          width: asset.width,
          height: asset.height,
          durationSec: asset.durationSec,
          createdAt: asset.createdAt,
          url,
          generation: asset.generationId && generationsById.has(asset.generationId)
            ? {
                prompt: generationsById.get(asset.generationId)?.prompt ?? null,
                model: generationsById.get(asset.generationId)?.model ?? "",
                type: generationsById.get(asset.generationId)?.type ?? "",
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      items: itemsWithUrls,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Assets fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

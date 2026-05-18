import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { createClient } from "@/lib/supabase/server";
import { createSignedDownloadUrl } from "@/lib/storage";

// GET /api/generate/history — List user's generation history
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
    const type = searchParams.get("type");
    const model = searchParams.get("model");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { userId: user.id };
    if (type) where.type = type;
    if (model) where.model = model;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.generation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          model: true,
          prompt: true,
          status: true,
          creditsCost: true,
          outputUrl: true,
          outputType: true,
          thumbnailUrl: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      prisma.generation.count({ where }),
    ]);

    const itemsWithUrls = await Promise.all(
      items.map(async (item) => {
        if (!item.outputUrl) return item;

        // Only sign R2 keys (not full external URLs)
        if (item.outputUrl.startsWith("http")) return item;

        try {
          return {
            ...item,
            outputUrl: await createSignedDownloadUrl(item.outputUrl, 60 * 30),
          };
        } catch {
          return item;
        }
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
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { createClient } from "@/lib/supabase/server";
import { createSignedDownloadUrl } from "@/lib/storage";
import { getProvider } from "@/lib/ai/registry";
import { models } from "@/config/models";

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
    let generation = await prisma.generation.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!generation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 如果状态还在处理中，主动查一下 Provider API 更新状态（本地环境 Webhook 不可用时的回退方案）
    if (
      (generation.status === "PENDING" || generation.status === "PROCESSING") &&
      generation.providerId
    ) {
      try {
        const model = models[generation.model];
        if (model) {
          const provider = getProvider(generation.provider);
          const providerStatus = await provider.getGenerationStatus(
            generation.providerId,
            model.providerModelId
          );

          // 根据 Provider 返回的状态更新数据库
          if (providerStatus.status === "SUCCEEDED" || providerStatus.status === "FAILED") {
            // 如果有输出，我们直接返回 Provider 的输出 URL（跳过 R2 存储，用于本地开发）
            // 或者可以调用 processProviderResult 完整处理
            let outputUrl = generation.outputUrl;
            let outputType = generation.outputType;
            let errorMessage = generation.errorMessage;
            let errorCode = generation.errorCode;

            if (providerStatus.status === "SUCCEEDED" && providerStatus.outputUrl) {
              outputUrl = providerStatus.outputUrl;
              outputType = generation.type.includes("VIDEO") ? "video" : "image";
            }
            if (providerStatus.status === "FAILED") {
              errorMessage = providerStatus.error ?? "Provider failed";
              errorCode = "PROVIDER_FAILED";
            }

            generation = await prisma.generation.update({
              where: { id: generation.id },
              data: {
                status: providerStatus.status,
                outputUrl,
                outputType,
                errorCode,
                errorMessage,
                completedAt: new Date(),
              },
            });
          }
        }
      } catch (pollError) {
        console.warn("Poll provider status failed:", pollError);
        // 忽略轮询错误，继续返回当前状态
      }
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

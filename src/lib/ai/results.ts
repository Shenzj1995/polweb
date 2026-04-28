import { prisma } from "@/db";
import { models } from "@/config/models";
import { getProvider } from "@/lib/ai/registry";
import { refundGenerationCredits } from "@/lib/credits";
import { uploadRemoteFileToR2 } from "@/lib/storage";
import type { GenStatusResult, WebhookResult } from "@/lib/ai/types";
import type { Prisma } from "@prisma/client";

type ProviderResult = WebhookResult | GenStatusResult;

export async function processProviderResult(params: {
  provider: string;
  eventId: string;
  eventType?: string;
  payload?: Prisma.InputJsonValue;
  result: ProviderResult & { providerId?: string };
}) {
  const log = await prisma.webhookLog.upsert({
    where: {
      provider_eventId: {
        provider: params.provider,
        eventId: params.eventId,
      },
    },
    create: {
      provider: params.provider,
      eventId: params.eventId,
      eventType: params.eventType,
      payload: params.payload,
    },
    update: {},
  });

  if (log.status === "PROCESSED") {
    return { skipped: true };
  }

  try {
    const providerId = params.result.providerId;
    if (!providerId) throw new Error("MISSING_PROVIDER_ID");

    const generation = await prisma.generation.findFirst({
      where: {
        provider: params.provider,
        providerId,
      },
    });

    if (!generation) throw new Error("GENERATION_NOT_FOUND");

    if (params.result.status === "SUCCEEDED" && params.result.outputUrl) {
      const mediaType = generation.type.includes("VIDEO") ? "video" : "image";
      const uploaded = await uploadRemoteFileToR2({
        url: params.result.outputUrl,
        prefix: `generations/${generation.userId}/${generation.id}`,
        fallbackExtension: mediaType === "video" ? ".mp4" : ".png",
      });

      const asset = await prisma.asset.create({
        data: {
          userId: generation.userId,
          generationId: generation.id,
          kind: "output",
          mediaType,
          storageKey: uploaded.key,
          mimeType: uploaded.contentType,
          sizeBytes: uploaded.sizeBytes,
          expiresAt: generation.expiresAt,
        },
      });

      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: "SUCCEEDED",
          outputUrl: uploaded.key,
          outputType: mediaType,
          completedAt: new Date(),
          errorCode: null,
          errorMessage: null,
        },
      });

      await markWebhookLogProcessed(log.id);
      return { skipped: false, generationId: generation.id, assetId: asset.id };
    }

    if (params.result.status === "FAILED") {
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: "FAILED",
          errorCode: "PROVIDER_FAILED",
          errorMessage: params.result.error ?? "Provider failed",
          completedAt: new Date(),
        },
      });

      await refundGenerationCredits({
        userId: generation.userId,
        generationId: generation.id,
        amount: generation.creditsCost,
      });

      await markWebhookLogProcessed(log.id);
      return { skipped: false, generationId: generation.id };
    }

    await markWebhookLogProcessed(log.id);
    return { skipped: false, generationId: generation.id };
  } catch (error) {
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown webhook error",
      },
    });
    throw error;
  }
}

export async function pollProcessingGenerations(limit = 10) {
  const stuck = await prisma.generation.findMany({
    where: {
      status: "PROCESSING",
      providerId: { not: null },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const results = [];
  for (const generation of stuck) {
    const model = models[generation.model];
    if (!model || !generation.providerId) continue;

    const provider = getProvider(generation.provider);
    const status = await provider.getGenerationStatus(generation.providerId, model.providerModelId);

    results.push(
      await processProviderResult({
        provider: generation.provider,
        eventId: `poll:${generation.providerId}:${status.status}`,
        eventType: "poll",
        payload: {
          generationId: generation.id,
          providerId: generation.providerId,
          status: status.status,
        },
        result: {
          ...status,
          providerId: generation.providerId,
        },
      })
    );
  }

  return results;
}

async function markWebhookLogProcessed(id: string) {
  await prisma.webhookLog.update({
    where: { id },
    data: {
      status: "PROCESSED",
      processedAt: new Date(),
      error: null,
    },
  });
}

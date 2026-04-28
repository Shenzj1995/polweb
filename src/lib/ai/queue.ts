import { prisma } from "@/db";
import { getProvider } from "@/lib/ai/registry";
import { models } from "@/config/models";
import { spendCredits, refundGenerationCredits } from "@/lib/credits";
import type { GenerationType } from "@/types/generation";
import type { Prisma } from "@prisma/client";

interface CreateGenerationInput {
  userId: string;
  type: GenerationType;
  modelSlug: string;
  prompt?: string;
  negativePrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  params: Record<string, unknown>;
}

export async function createGeneration(input: CreateGenerationInput) {
  const model = models[input.modelSlug];
  if (!model) throw new Error("MODEL_NOT_FOUND");

  const creditsCost = model.creditsCost[input.type];
  if (!creditsCost) throw new Error("UNSUPPORTED_TYPE");
  if (!model.type.includes(input.type)) throw new Error("UNSUPPORTED_TYPE");

  const result = await prisma.$transaction(async (tx) => {
    const activeCount = await tx.generation.count({
      where: {
        userId: input.userId,
        status: { in: ["PENDING", "PROCESSING"] },
      },
    });

    const user = await tx.user.findUnique({
      where: { id: input.userId },
      select: { plan: true },
    });

    if (!user) throw new Error("USER_NOT_FOUND");

    const parallelLimit = user.plan === "PRO" ? 3 : user.plan === "STARTER" ? 2 : 1;
    if (activeCount >= parallelLimit) throw new Error("CONCURRENCY_LIMIT");

    const generation = await tx.generation.create({
      data: {
        userId: input.userId,
        type: input.type,
        model: input.modelSlug,
        provider: model.provider,
        prompt: input.prompt,
        negativePrompt: input.negativePrompt,
        imageUrl: input.imageUrl,
        videoUrl: input.videoUrl,
        params: input.params as Prisma.InputJsonObject,
        creditsCost,
        expiresAt: getGenerationExpiry(user.plan),
      },
    });

    const creditsRemaining = await spendCredits({
      tx,
      userId: input.userId,
      amount: creditsCost,
      description: `${input.type} with ${model.name}`,
      refId: generation.id,
    });

    return { generation, creditsRemaining };
  });

  // Call AI provider
  const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/${model.provider}`;
  const provider = getProvider(model.provider);

  try {
    const aiResult = await provider.createGeneration({
      type: input.type,
      model: input.modelSlug,
      providerModelId: model.providerModelId,
      prompt: input.prompt,
      negativePrompt: input.negativePrompt,
      imageUrl: input.imageUrl,
      videoUrl: input.videoUrl,
      params: input.params,
      webhookUrl,
    });

    await prisma.generation.update({
      where: { id: result.generation.id },
      data: {
        status: "PROCESSING",
        providerId: aiResult.providerId,
      },
    });

    return {
      id: result.generation.id,
      status: "PROCESSING",
      creditsCost,
      creditsRemaining: result.creditsRemaining,
    };
  } catch (error) {
    await refundGenerationCredits({
      userId: input.userId,
      amount: creditsCost,
      generationId: result.generation.id,
    });

    await prisma.generation.update({
      where: { id: result.generation.id },
      data: {
        status: "FAILED",
        errorCode: "PROVIDER_CREATE_FAILED",
        errorMessage: error instanceof Error ? error.message : "Provider create failed",
        completedAt: new Date(),
      },
    });

    throw error;
  }
}

function getGenerationExpiry(plan: string) {
  const now = Date.now();
  if (plan === "FREE") return new Date(now + 7 * 24 * 60 * 60 * 1000);
  if (plan === "STARTER") return new Date(now + 30 * 24 * 60 * 60 * 1000);
  return null;
}

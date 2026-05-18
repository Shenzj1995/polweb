import { prisma } from "@/db";
import type { Prisma, PrismaClient } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export async function spendCredits(params: {
  tx: Tx;
  userId: string;
  amount: number;
  description: string;
  refId: string;
}) {
  const user = await params.tx.user.update({
    where: {
      id: params.userId,
      credits: { gte: params.amount },
    },
    data: {
      credits: { decrement: params.amount },
    },
    select: { credits: true },
  });

  if (!user) throw new Error("INSUFFICIENT_CREDITS");

  await params.tx.creditLog.create({
    data: {
      userId: params.userId,
      amount: -params.amount,
      type: "GENERATION_CONSUME",
      description: params.description,
      refId: params.refId,
      balanceAfter: user.credits,
    },
  });

  return user.credits;
}

export async function refundGenerationCredits(params: {
  userId: string;
  generationId: string;
  amount: number;
  description?: string;
  client?: PrismaClient;
}) {
  const client = params.client ?? prisma;

  return client.$transaction(async (tx) => {
    const existing = await tx.creditLog.findUnique({
      where: {
        type_refId: {
          type: "REFUND",
          refId: params.generationId,
        },
      },
    });

    if (existing) return { refunded: false, balanceAfter: existing.balanceAfter };

    const user = await tx.user.update({
      where: { id: params.userId },
      data: { credits: { increment: params.amount } },
      select: { credits: true },
    });

    await tx.creditLog.create({
      data: {
        userId: params.userId,
        amount: params.amount,
        type: "REFUND",
        description: params.description ?? `Refund for failed generation ${params.generationId}`,
        refId: params.generationId,
        balanceAfter: user.credits,
      },
    });

    return { refunded: true, balanceAfter: user.credits };
  });
}

export async function grantCreditsOnce(params: {
  tx: Tx;
  userId: string;
  amount: number;
  type: "SIGNUP_BONUS" | "SUBSCRIPTION" | "ADDON_PURCHASE" | "ADMIN_ADJUST";
  refId: string;
  description: string;
}) {
  const existing = await params.tx.creditLog.findUnique({
    where: {
      type_refId: {
        type: params.type,
        refId: params.refId,
      },
    },
  });

  if (existing) return { granted: false, balanceAfter: existing.balanceAfter };

  const user = await params.tx.user.update({
    where: { id: params.userId },
    data: { credits: { increment: params.amount } },
    select: { credits: true },
  });

  await params.tx.creditLog.create({
    data: {
      userId: params.userId,
      amount: params.amount,
      type: params.type,
      refId: params.refId,
      description: params.description,
      balanceAfter: user.credits,
    },
  });

  return { granted: true, balanceAfter: user.credits };
}

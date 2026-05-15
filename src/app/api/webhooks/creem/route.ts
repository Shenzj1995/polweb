import { Webhook } from "@creem_io/nextjs";
import { prisma } from "@/db";
import { PLANS, type PlanKey } from "@/config/plans";
import { grantCreditsOnce } from "@/lib/credits";

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,
  onGrantAccess: async ({ product, customer, metadata, reason }) => {
    const userId = metadata?.referenceId as string | undefined;
    if (!userId) return;

    const planKey = getPlanKey(product.id);
    if (planKey === "FREE") return;

    const plan = PLANS[planKey];

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { plan: planKey, stripeCustomerId: customer.id },
      });

      await grantCreditsOnce({
        tx,
        userId,
        amount: plan.credits,
        type: "SUBSCRIPTION",
        description: `${plan.name} plan — ${plan.credits} credits (${reason})`,
        refId: `creem:${reason}:${customer.id}:${planKey}`,
      });
    });
  },
  onRevokeAccess: async ({ metadata }) => {
    const userId = metadata?.referenceId as string | undefined;
    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: { plan: "FREE" },
    });
  },
  onCheckoutCompleted: async ({ product, customer, subscription }) => {
    console.log("Creem checkout completed:", customer?.email, product.name, subscription?.id);
  },
  onSubscriptionCanceled: async ({ metadata, customer }) => {
    const userId = metadata?.referenceId as string | undefined;
    if (!userId) return;

    await prisma.user.update({
      where: { id: userId },
      data: { plan: "FREE" },
    });
  },
});

function getPlanKey(productId: string): PlanKey {
  if (
    productId === process.env.CREEM_STARTER_PRODUCT_ID ||
    productId === process.env.NEXT_PUBLIC_CREEM_STARTER_MONTHLY_PRODUCT_ID ||
    productId === process.env.NEXT_PUBLIC_CREEM_STARTER_ANNUAL_PRODUCT_ID
  )
    return "STARTER";
  if (
    productId === process.env.CREEM_PRO_PRODUCT_ID ||
    productId === process.env.NEXT_PUBLIC_CREEM_PRO_MONTHLY_PRODUCT_ID ||
    productId === process.env.NEXT_PUBLIC_CREEM_PRO_ANNUAL_PRODUCT_ID
  )
    return "PRO";
  return "FREE";
}

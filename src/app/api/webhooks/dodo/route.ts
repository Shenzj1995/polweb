import { NextResponse } from "next/server";
import { prisma } from "@/db";
import { PLANS, type PlanKey } from "@/config/plans";
import { grantCreditsOnce } from "@/lib/credits";

// DodoPayments webhook handler — manually verifies and routes events.
// We don't use the @dodopayments/nextjs Webhooks helper because it
// crashes at build time when DODO_PAYMENTS_WEBHOOK_KEY is empty.

interface DodoWebhookPayload {
  type: string;
  payload_id: string;
  customer_id?: string;
  product_id?: string;
  metadata?: {
    userId?: string;
  };
}

async function verifySignature(body: string, signature: string): Promise<boolean> {
  const crypto = await import("node:crypto");
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!secret) return false;

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("webhook-signature") || "";

  if (!(await verifySignature(body, signature))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: DodoWebhookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (payload.type) {
      case "payment.succeeded":
        console.log("Dodo payment succeeded:", payload.payload_id);
        break;

      case "subscription.active":
        await handleSubscriptionActive(payload);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancelled(payload);
        break;

      case "subscription.renewed":
        await handleSubscriptionRenewed(payload);
        break;

      default:
        console.log("Dodo webhook event:", payload.type, payload.payload_id);
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionActive(payload: DodoWebhookPayload) {
  const customerId = payload.customer_id;
  const metadata = payload.metadata || {};
  const userId = metadata.userId;
  if (!userId) return;

  const productId = payload.product_id;
  if (!productId) return;
  const planKey = getPlanKey(productId);
  if (planKey === "FREE") return;

  const plan = PLANS[planKey];

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { plan: planKey, stripeCustomerId: customerId },
    });

    await grantCreditsOnce({
      tx,
      userId,
      amount: plan.credits,
      type: "SUBSCRIPTION",
      description: `${plan.name} plan — ${plan.credits} credits`,
      refId: `dodo:${payload.payload_id}:${planKey}`,
    });
  });
}

async function handleSubscriptionCancelled(payload: DodoWebhookPayload) {
  const metadata = payload.metadata || {};
  const userId = metadata.userId;
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { plan: "FREE" },
  });
}

async function handleSubscriptionRenewed(payload: DodoWebhookPayload) {
  const metadata = payload.metadata || {};
  const userId = metadata.userId;
  if (!userId) return;

  const productId = payload.product_id;
  if (!productId) return;
  const planKey = getPlanKey(productId);
  if (planKey === "FREE") return;

  const plan = PLANS[planKey];

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { plan: planKey },
    });

    await grantCreditsOnce({
      tx,
      userId,
      amount: plan.credits,
      type: "SUBSCRIPTION",
      description: `${plan.name} plan renewal — ${plan.credits} credits`,
      refId: `dodo:renew:${payload.payload_id}:${planKey}`,
    });
  });
}

function getPlanKey(productId: string): PlanKey {
  if (productId === process.env.DODO_STARTER_PRODUCT_ID) return "STARTER";
  if (productId === process.env.DODO_PRO_PRODUCT_ID) return "PRO";
  return "FREE";
}

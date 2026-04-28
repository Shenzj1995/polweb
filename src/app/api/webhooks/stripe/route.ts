import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/db";
import { PLANS, type PlanKey } from "@/config/plans";
import { grantCreditsOnce } from "@/lib/credits";
import type { Prisma } from "@prisma/client";
import type Stripe from "stripe";

type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start?: number;
  current_period_end?: number;
};

// POST /api/webhooks/stripe — Handle Stripe webhook events
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const log = await prisma.webhookLog.upsert({
      where: {
        provider_eventId: {
          provider: "stripe",
          eventId: event.id,
        },
      },
      create: {
        provider: "stripe",
        eventId: event.id,
        eventType: event.type,
        payload: event as unknown as Prisma.InputJsonObject,
      },
      update: {},
    });

    if (log.status === "PROCESSED") {
      return NextResponse.json({ received: true, skipped: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDelete(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("Payment failed for customer:", invoice.customer);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { status: "PROCESSED", processedAt: new Date(), error: null },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planKey = session.metadata?.planKey as PlanKey;
  const subscriptionId = session.subscription as string;

  if (!userId || !planKey || !subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as StripeSubscriptionWithPeriod;
  const plan = PLANS[planKey];

  const periodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000)
    : new Date();

  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : new Date();

  await prisma.$transaction(async (tx) => {
    await tx.subscription.upsert({
      where: { stripeSubId: subscriptionId },
      update: {
        plan: planKey,
        status: "ACTIVE",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId,
        stripeSubId: subscriptionId,
        stripePriceId: (subscription.items.data[0] as { price: { id: string } }).price.id,
        plan: planKey,
        status: "ACTIVE",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { plan: planKey },
    });

    await grantCreditsOnce({
      tx,
      userId,
      amount: plan.credits,
      type: "SUBSCRIPTION",
      description: `${plan.name} plan — ${plan.credits} credits`,
      refId: `${subscriptionId}:${planKey}:${periodEnd.toISOString()}`,
    });
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const sub = subscription as StripeSubscriptionWithPeriod;
  const subRecord = await prisma.subscription.findUnique({
    where: { stripeSubId: subscription.id },
  });

  if (!subRecord) return;

  const priceId = subscription.items.data[0]?.price?.id;
  let planKey: PlanKey = "FREE";

  if (priceId) {
    if (
      priceId === process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ||
      priceId === process.env.STRIPE_STARTER_ANNUAL_PRICE_ID
    ) {
      planKey = "STARTER";
    } else if (
      priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID ||
      priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID
    ) {
      planKey = "PRO";
    }
  }

  const plan = PLANS[planKey];

  const periodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : new Date();

  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : new Date();

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { stripeSubId: subscription.id },
      data: {
        plan: planKey,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
      },
    });

    await tx.user.update({
      where: { id: subRecord.userId },
      data: { plan: planKey },
    });

    if (planKey !== subRecord.plan && planKey !== "FREE") {
      await grantCreditsOnce({
        tx,
        userId: subRecord.userId,
        amount: plan.credits,
        type: "SUBSCRIPTION",
        description: `Upgraded to ${plan.name} — ${plan.credits} credits`,
        refId: `${subscription.id}:${planKey}:${periodEnd.toISOString()}`,
      });
    }
  });
}

async function handleSubscriptionDelete(subscription: Stripe.Subscription) {
  const subRecord = await prisma.subscription.findUnique({
    where: { stripeSubId: subscription.id },
  });

  if (!subRecord) return;

  await prisma.subscription.update({
    where: { stripeSubId: subscription.id },
    data: { status: "ENDED" },
  });

  await prisma.user.update({
    where: { id: subRecord.userId },
    data: { plan: "FREE" },
  });
}

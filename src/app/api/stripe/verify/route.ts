import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/db";
import { PLANS, type PlanKey } from "@/config/plans";
import { grantCreditsOnce } from "@/lib/credits";

type StripeSubscriptionWithPeriod = Awaited<
  ReturnType<typeof stripe.subscriptions.retrieve>
> & {
  current_period_start?: number;
  current_period_end?: number;
};

// POST /api/stripe/verify — Verify and sync subscription after checkout
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });
    }

    // Get active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: dbUser.stripeCustomerId,
      status: "active",
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ plan: "FREE", credits: dbUser.credits });
    }

    // Use the first active subscription
    const subscription = subscriptions.data[0] as StripeSubscriptionWithPeriod;
    const priceId = subscription.items.data[0]?.price?.id;

    // Determine plan from price ID
    let planKey: PlanKey = "FREE";
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

    if (planKey === "FREE") {
      return NextResponse.json({ plan: "FREE", credits: dbUser.credits });
    }

    const plan = PLANS[planKey];

    // Upsert subscription record
    const existingSub = await prisma.subscription.findUnique({
      where: { stripeSubId: subscription.id },
    });

    if (!existingSub) {
      const periodStart = subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : new Date();
      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : new Date();

      await prisma.$transaction(async (tx) => {
        await tx.subscription.create({
          data: {
            userId: user.id,
            stripeSubId: subscription.id,
            stripePriceId: priceId,
            plan: planKey,
            status: "ACTIVE",
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          },
        });

        await tx.user.update({
          where: { id: user.id },
          data: { plan: planKey },
        });

        await grantCreditsOnce({
          tx,
          userId: user.id,
          amount: plan.credits,
          type: "SUBSCRIPTION",
          description: `${plan.name} plan — ${plan.credits} credits`,
          refId: `${subscription.id}:${planKey}:${periodEnd.toISOString()}`,
        });
      });
    }

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true, credits: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify subscription" },
      { status: 500 }
    );
  }
}

export type PlanKey = "FREE" | "STARTER" | "PRO";

export interface PlanConfig {
  name: string;
  price: number;
  annualPrice: number;
  credits: number;
  imageLimit: number;
  videoLimit: number;
  parallelTasks: number;
  features: string[];
  lockedFeatures?: string[];
}

export const PLANS: Record<PlanKey, PlanConfig> = {
  FREE: {
    name: "Free",
    price: 0,
    annualPrice: 0,
    credits: 20,
    imageLimit: 20,
    videoLimit: 2,
    parallelTasks: 1,
    features: [
      "All-in-one multi-model support",
      "Text/Image/Video to video",
      "Text/Image to image",
      "300+ templates & effects",
      "100+ AI image & video tools",
    ],
    lockedFeatures: [
      "No-watermark outputs",
      "Private video visibility",
      "Copy protection",
      "Faster generation speed",
    ],
  },
  STARTER: {
    name: "Starter",
    price: 12,
    annualPrice: 8,
    credits: 300,
    imageLimit: 300,
    videoLimit: 30,
    parallelTasks: 2,
    features: [
      "Everything in Free, plus:",
      "No-watermark outputs",
      "Private video visibility",
      "Copy protection",
      "Faster generation speed",
    ],
  },
  PRO: {
    name: "Pro",
    price: 29,
    annualPrice: 14.5,
    credits: 800,
    imageLimit: 800,
    videoLimit: 80,
    parallelTasks: 3,
    features: [
      "Everything in Starter, plus:",
      "Priority generation queue",
      "More camera movement options",
      "Advanced audio generation",
    ],
  },
};

export function getPlan(key: PlanKey): PlanConfig {
  return PLANS[key];
}

export function getPriceId(planKey: PlanKey, annual: boolean): string | null {
  // These would map to actual Stripe Price IDs
  const priceMap: Record<string, { monthly: string | null; annual: string | null }> = {
    STARTER: { monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || null, annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || null },
    PRO: { monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || null, annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || null },
  };
  const plan = priceMap[planKey];
  if (!plan) return null;
  return annual ? plan.annual : plan.monthly;
}

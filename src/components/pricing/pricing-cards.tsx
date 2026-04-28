"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Sparkles } from "lucide-react";
import { PLANS, type PlanKey } from "@/config/plans";
import { useAuth } from "@/lib/supabase/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

const planOrder: PlanKey[] = ["FREE", "STARTER", "PRO"];

export function PricingCards() {
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleCheckout = async (planKey: PlanKey) => {
    // Wait for auth to finish loading
    if (loading) return;

    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, annual }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.assign(data.url);
      } else {
        console.error("Checkout error:", data.error, "status:", res.status);
        alert(data.error || "Failed to start checkout");
      }
    } catch (err) {
      console.error("Checkout fetch error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      {/* Toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <span className={`text-sm ${!annual ? "font-medium text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
            annual ? "bg-violet-500" : "bg-muted"
          }`}
        >
          <span
            className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              annual ? "translate-x-[22px]" : "translate-x-[2px]"
            }`}
          />
        </button>
        <span className={`text-sm ${annual ? "font-medium text-foreground" : "text-muted-foreground"}`}>
          Yearly
        </span>
        <Badge className="bg-green-500/20 text-green-400 text-[11px]">Save up to 50%</Badge>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch">
        {planOrder.map((key) => {
          const plan = PLANS[key];
          const price = annual ? plan.annualPrice : plan.price;
          const isPro = key === "PRO";
          const isLoading = loadingPlan === key;

          return (
            <div
              key={key}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                isPro
                  ? "border-violet-500/50 bg-gradient-to-b from-violet-500/5 to-transparent shadow-lg shadow-violet-500/10"
                  : "border-border/50 bg-card"
              }`}
            >
              {/* Badge */}
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md">
                    <Sparkles className="mr-1 h-3 w-3" /> Most Popular
                  </Badge>
                </div>
              )}

              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-3">
                  {plan.price > 0 ? (
                    <div className="flex items-baseline gap-1.5">
                      {annual && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${plan.price}
                        </span>
                      )}
                      <span className="text-4xl font-extrabold">${price}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-extrabold">Free</span>
                  )}
                  {annual && plan.price > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      ${price * 12}/year — Save ${(plan.price - price) * 12}
                    </p>
                  )}
                </div>
              </div>

              {/* Credits */}
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-sm font-semibold">{plan.credits} credits</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </div>

              {/* Features */}
              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {key === "FREE" ? (
                <Link
                  href="/signup"
                  className="mt-auto flex h-10 w-full items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:bg-accent"
                >
                  Try Now
                </Link>
              ) : (
                <button
                  onClick={() => handleCheckout(key)}
                  disabled={isLoading}
                  className={`mt-auto flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                    isPro
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md hover:from-violet-600 hover:to-fuchsia-600"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Get Started"
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

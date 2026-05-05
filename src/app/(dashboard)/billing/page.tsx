"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { PLANS } from "@/config/plans";
import { useAuth } from "@/lib/supabase/auth-context";

export default function BillingPage() {
  const { user, credits, plan: userPlan, loading, refreshCredits } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [creditHistory, setCreditHistory] = useState<
    { type: string; amount: number; description: string; createdAt: string }[]
  >([]);

  const plan = PLANS[(userPlan as keyof typeof PLANS) || "FREE"] || PLANS.FREE;
  const totalCredits = plan.credits;

  // Verify subscription after checkout success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true" && user && !verifying && !verified) {
      const verifySubscription = async () => {
        setVerifying(true);
        try {
          await fetch("/api/stripe/verify", { method: "POST" });
          await refreshCredits();
          setVerified(true);
          window.location.href = "/billing";
        } catch {
          setVerifying(false);
        }
      };

      void verifySubscription();
    }
  }, [user, verifying, verified, refreshCredits]);

  // Fetch credit history
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/credits")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCreditHistory)
      .catch(() => {});
  }, [user]);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "No billing account found");
      }
    } catch {
      alert("Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading || verifying) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        {verifying && <p className="text-sm text-muted-foreground">Verifying your subscription...</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your plan and credits</p>
      </div>

      {/* Current Plan */}
      <Card className="mb-6 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{plan.name} Plan</h2>
              <Badge variant="secondary" className="bg-violet-500/20 text-violet-400">
                Current
              </Badge>
            </div>
            {userPlan !== "FREE" ? (
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-60"
              >
                {portalLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-3 w-3" />
                    Manage Billing
                  </>
                )}
              </button>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex h-8 items-center gap-1 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-xs font-medium text-white hover:from-violet-600 hover:to-fuchsia-600"
              >
                <ArrowUpRight className="h-3 w-3" />
                Upgrade
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">${plan.price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.credits} credits/month &middot; Up to {plan.videoLimit} videos &middot; Up to {plan.imageLimit} images
          </p>
        </CardContent>
      </Card>

      {/* Credits Overview */}
      <Card className="mb-6 border-border/50">
        <CardHeader className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CreditCard className="h-5 w-5" />
            Credits
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{credits}</span>
            <span className="text-muted-foreground">/ {totalCredits} remaining</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
              style={{ width: `${Math.min((credits / totalCredits) * 100, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {userPlan === "FREE"
              ? "Sign-up credits are one-time. Upgrade for monthly credits."
              : "Credits reset at the start of each billing cycle"}
          </p>
        </CardContent>
      </Card>

      {/* Credit History */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <h2 className="text-lg font-semibold">Credit History</h2>
        </CardHeader>
        <CardContent>
          {creditHistory.length > 0 ? (
            <div className="space-y-3">
              {creditHistory.map((entry, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{entry.description || entry.type}</span>
                    <span
                      className={`text-sm font-medium ${
                        entry.amount > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {entry.amount > 0 ? "+" : ""}
                      {entry.amount}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                  {i < creditHistory.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {user ? "Loading history..." : "Sign in to view your credit history."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

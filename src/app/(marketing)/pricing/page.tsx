import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PricingCards } from "@/components/pricing/pricing-cards";

export const metadata = {
  title: "Pricing",
  description: "Choose the plan that fits your creative needs. Start free, upgrade anytime.",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">Simple, transparent pricing</h1>
            <p className="text-lg text-muted-foreground">
              One subscription gives you access to every AI model. No hidden fees.
            </p>
          </div>
          <PricingCards />
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const faqs = [
  {
    q: "What happens if a generation fails?",
    a: "If a generation fails due to a provider error, timeout, or system issue, your credits are automatically returned to your account. No action needed on your part.",
  },
  {
    q: "Can I get a refund if I'm not satisfied with the result?",
    a: "AI-generated content has inherent variability. Because results depend on the prompt and model, successfully completed generations that are subjectively unsatisfactory are generally not eligible for a refund. Failed generations are automatically refunded in credits. For billing disputes, see our Refund Policy.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "You can cancel anytime from the Billing page. Your subscription remains active until the end of the current billing period — no prorated charges, no surprises.",
  },
  {
    q: "Do unused credits carry over?",
    a: "Unused subscription credits do not roll over to the next billing cycle. Free plan credits are a one-time signup allocation and do not refresh monthly.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept major credit and debit cards (Visa, Mastercard, American Express) and other payment methods supported by our payment processor.",
  },
  {
    q: "Can I switch plans?",
    a: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new plan and credits take effect immediately. When downgrading, the change takes effect at the end of your current billing period.",
  },
];

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

          {/* FAQ */}
          <section className="mx-auto mt-16 max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.q} className="border-border/50">
                  <CardContent className="p-5">
                    <h3 className="mb-2 font-medium">{faq.q}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Have more questions?{" "}
              <Link href="/refund" className="text-foreground underline underline-offset-4 hover:text-violet-400">
                Refund Policy
              </Link>
              {" · "}
              <Link href="/terms" className="text-foreground underline underline-offset-4 hover:text-violet-400">
                Terms of Service
              </Link>
              {" · "}
              <a href="mailto:support@polzj.com" className="text-foreground underline underline-offset-4 hover:text-violet-400">
                Contact Us
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

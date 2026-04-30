import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Refund Policy",
  description: `Refund Policy for ${siteConfig.name}.`,
};

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      description={`This Refund Policy explains how refunds and credit adjustments work for ${siteConfig.name}.`}
      lastUpdated="April 29, 2026"
      sections={[
        {
          title: "Subscriptions",
          body: [
            "Subscriptions renew automatically unless canceled before the next billing date.",
            "Canceling a subscription stops future renewal. It does not automatically refund the current billing period.",
            "If you believe you were charged in error, contact support with your account email and payment receipt.",
          ],
        },
        {
          title: "Credits",
          body: [
            "Credits are consumed when a generation task is submitted and accepted by the system.",
            "If a generation fails because of a provider error, timeout, or system error, we aim to automatically return the consumed credits to your account.",
            "Credits are not redeemable for cash and are generally non-transferable.",
          ],
        },
        {
          title: "Failed Generations",
          body: [
            "A failed generation caused by infrastructure, provider, or internal service errors may qualify for an automatic credit refund.",
            "A generation may not qualify for refund if it completed successfully but the result is subjective, unexpected, or not preferred.",
            "Content blocked by safety systems may be refunded in credits when no output is delivered.",
          ],
        },
        {
          title: "Eligibility Window",
          body: [
            "Refund requests should be submitted within 7 days of the charge or failed transaction.",
            "We may request additional information to verify the account, payment, generation ID, or error condition.",
          ],
        },
        {
          title: "How Refunds Are Issued",
          body: [
            "Eligible subscription or payment refunds are normally returned to the original payment method through our payment processor.",
            "Eligible generation failures are normally handled as credit refunds to your account balance.",
            "Processing times may vary depending on Stripe, your bank, card network, or local payment method.",
          ],
        },
        {
          title: "Abuse Prevention",
          body: [
            "We may deny refund requests connected to abuse, policy violations, repeated misuse, chargeback fraud, or attempts to bypass credit limits.",
            "We may suspend accounts involved in payment abuse or generation abuse.",
          ],
        },
      ]}
    />
  );
}

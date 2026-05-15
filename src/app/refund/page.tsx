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
      description={`This Refund Policy explains how refunds and credit adjustments work for ${siteConfig.name}. It applies to subscriptions, credits, and one-time purchases made through our service.`}
      lastUpdated="May 8, 2026"
      sections={[
        {
          title: "Subscriptions",
          body: [
            "Subscriptions renew automatically unless canceled before the next billing date.",
            "Canceling a subscription stops future renewal. You will retain access until the end of the current billing period. No prorated refund is issued for the remaining days of the current period.",
            "If you believe you were charged in error, contact us at support@polzj.com with your account email and payment receipt.",
          ],
        },
        {
          title: "Credits",
          body: [
            "Credits are consumed when a generation task is submitted and accepted by the system.",
            "Credits that have been consumed for successfully completed generations are non-refundable.",
            "Credits are not redeemable for cash and are non-transferable.",
            "Unused credits from a free plan are one-time signup credits and do not refresh monthly.",
          ],
        },
        {
          title: "Failed Generations",
          body: [
            "A failed generation caused by infrastructure, provider, or internal service errors qualifies for an automatic credit refund.",
            "AI-generated results have inherent uncertainty. A generation that completes successfully but is subjectively unsatisfactory does not qualify for a refund.",
            "Content blocked by safety systems will be refunded in credits when no output is delivered.",
            "Failed generation credits are typically returned to your account within a few minutes.",
          ],
        },
        {
          title: "Refund Eligibility",
          body: [
            "The following situations may qualify for a refund: accidental or duplicate charges, unused credits due to a platform outage, billing errors, or charges for a service that was unavailable.",
            "The following situations do not qualify for a refund: credits already consumed for successful generations, violations of our Terms of Service or Acceptable Use Policy, refund requests submitted after the eligibility window, or subjective dissatisfaction with AI-generated content.",
          ],
        },
        {
          title: "Eligibility Window",
          body: [
            "Refund requests must be submitted within 7 days of the charge.",
            "We may request additional information to verify the account, payment, generation ID, or error condition.",
          ],
        },
        {
          title: "How to Request a Refund",
          body: [
            `To request a refund, send an email to support@polzj.com with the following information: your account email, order ID or transaction reference, reason for the refund request, and any supporting screenshots or details.`,
            "Our team will review your request and respond within 2 business days.",
            "Before initiating a chargeback with your bank or card issuer, please contact us first. Chargebacks initiated without prior contact may result in account suspension.",
          ],
        },
        {
          title: "How Refunds Are Issued",
          body: [
            "Eligible subscription or payment refunds are returned to the original payment method through our payment processor (DodoPayments or Creem), acting as the Merchant of Record.",
            "Eligible generation failures are handled as credit refunds to your account balance.",
            "Refunds to your payment method typically take 5–10 business days to appear, depending on your bank, card network, or local payment method.",
          ],
        },
        {
          title: "Payment Processor",
          body: [
            "Payments and refunds are processed by DodoPayments (dodopayments.com) or Creem (creem.io), acting as the Merchant of Record. The payment processor is the legal seller for billing purposes and handles payment collection, tax remittance, and refund processing on our behalf.",
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

import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description={`These Terms govern your access to and use of ${siteConfig.name}, including our AI generation, credit, subscription, and asset management features.`}
      lastUpdated="May 8, 2026"
      sections={[
        {
          title: "Acceptance of Terms",
          body: [
            "By creating an account, purchasing credits, starting a subscription, or using the service, you agree to these Terms.",
            "If you use the service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.",
            `These Terms were last updated on May 8, 2026. We may update them periodically. Continued use after changes constitutes acceptance.`,
          ],
        },
        {
          title: "What You Are Purchasing",
          body: [
            `${siteConfig.name} is an AI-powered platform for generating videos and images from text prompts and uploaded inputs.`,
            "When you subscribe to a paid plan, you purchase a monthly or annual allocation of credits that can be used to submit AI generation requests.",
            "Credits are not a stored-value currency and cannot be exchanged for cash.",
            "Free plan users receive a one-time signup credit allocation. These credits do not refresh monthly.",
          ],
        },
        {
          title: "Accounts",
          body: [
            "You are responsible for maintaining the confidentiality of your account and for all activity under your account.",
            "You must provide accurate account and billing information and keep it up to date.",
            "You may not create multiple accounts to abuse free credits, circumvent limits, or exploit promotions.",
          ],
        },
        {
          title: "Credits and Subscriptions",
          body: [
            "Credits are used to submit AI generation requests. Credit cost varies by model, generation type, duration, resolution, and other parameters.",
            "Subscription credits are granted according to the plan shown at checkout. Unused subscription credits do not roll over to the next billing period unless explicitly stated.",
            "We may change plans, credit pricing, or model availability with reasonable notice where practical.",
            "Paid subscription credits refresh at the start of each billing cycle.",
          ],
        },
        {
          title: "Canceling a Subscription",
          body: [
            "You may cancel your subscription at any time from the Billing page or by contacting support@polzj.com.",
            "Cancellation takes effect at the end of the current billing period. You will retain access to your plan and remaining credits until then.",
            "Canceling a subscription does not automatically refund the current billing period. See our Refund Policy for details.",
          ],
        },
        {
          title: "Failed Generations and Credit Refunds",
          body: [
            "If a generation fails due to a provider error, timeout, infrastructure issue, or internal system error, we will automatically return the consumed credits to your account.",
            "A generation that completes successfully but produces a result that is subjectively unsatisfactory does not qualify for a credit refund. AI outputs have inherent variability.",
            "Generations blocked by safety systems where no output is delivered will be refunded in credits.",
            "For full details, see our Refund Policy.",
          ],
        },
        {
          title: "User Content and Responsibility",
          body: [
            "You are responsible for prompts, uploads, generated outputs, and any content you publish or download through the service.",
            "You must have the rights and permissions needed for any content you upload or use as input.",
            "You may not use the service to create illegal, harmful, abusive, infringing, deceptive, or privacy-violating content.",
          ],
        },
        {
          title: "Prohibited Content and Use",
          body: [
            "You may not use the service to generate or upload content that is illegal, fraudulent, or harmful in any jurisdiction.",
            "You may not generate or distribute sexually explicit, pornographic, or NSFW content, including AI-generated imagery or video depicting nudity or sexual acts.",
            "You may not create deepfakes, face swaps, or AI-generated depictions of real individuals without their consent.",
            "You may not generate content involving the sexualization, exploitation, or abuse of minors in any form.",
            "You may not use the service to produce misleading political, medical, financial, or legal content intended to deceive.",
            "Full details on prohibited content and enforcement are in our Acceptable Use Policy.",
          ],
        },
        {
          title: "AI Output",
          body: [
            "AI outputs may be inaccurate, unexpected, similar to other outputs, or unsuitable for a particular use. You are responsible for reviewing outputs before use.",
            "Model availability, quality, generation speed, and moderation behavior may depend on third-party providers.",
            "You are solely responsible for how you use, share, publish, or distribute AI-generated content.",
          ],
        },
        {
          title: "Prohibited Technical Use",
          body: [
            "You may not reverse engineer, overload, scrape, resell access without permission, bypass limits, abuse promotions, or interfere with the service.",
            "We may suspend or terminate accounts that violate these Terms, create risk, or attempt payment or credit abuse.",
            "We may pause or suspend accounts involved in abuse, fraudulent activity, or repeated policy violations.",
          ],
        },
        {
          title: "Service Availability",
          body: [
            "The service may be unavailable due to maintenance, provider downtime, rate limits, network issues, or other operational reasons.",
            "We may modify, suspend, or discontinue features as needed to operate the service.",
            "Individual AI models may become temporarily or permanently unavailable depending on third-party provider decisions.",
          ],
        },
        {
          title: "Limitation of Liability",
          body: [
            "The service is provided on an as-is and as-available basis to the maximum extent permitted by law.",
            "We are not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, lost data, or business interruption.",
          ],
        },
        {
          title: "Refund Policy",
          body: [
            "Our Refund Policy explains eligibility, processing times, and how to request a refund. It is incorporated into these Terms by reference.",
            "For subscription cancellations, credit refunds, and failed generation handling, please see our Refund Policy.",
          ],
        },
      ]}
    />
  );
}

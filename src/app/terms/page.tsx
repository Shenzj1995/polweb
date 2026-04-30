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
      lastUpdated="April 29, 2026"
      sections={[
        {
          title: "Acceptance of Terms",
          body: [
            "By creating an account, purchasing credits, starting a subscription, or using the service, you agree to these Terms.",
            "If you use the service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.",
          ],
        },
        {
          title: "Accounts",
          body: [
            "You are responsible for maintaining the confidentiality of your account and for all activity under your account.",
            "You must provide accurate account and billing information and keep it up to date.",
          ],
        },
        {
          title: "Credits and Subscriptions",
          body: [
            "Credits are used to submit AI generation requests. Credit cost may vary by model, generation type, duration, resolution, or other parameters.",
            "Subscription credits are granted according to the plan shown at checkout. Unless stated otherwise, unused credits are not cash, stored value, or transferable currency.",
            "We may change plans, credit pricing, or model availability with reasonable notice where practical.",
          ],
        },
        {
          title: "User Content",
          body: [
            "You are responsible for prompts, uploads, generated outputs, and any content you publish or download through the service.",
            "You must have the rights and permissions needed for any content you upload or use as input.",
            "You may not use the service to create illegal, harmful, abusive, infringing, deceptive, or privacy-violating content.",
          ],
        },
        {
          title: "AI Output",
          body: [
            "AI outputs may be inaccurate, unexpected, similar to other outputs, or unsuitable for a particular use. You are responsible for reviewing outputs before use.",
            "Model availability, quality, generation speed, and moderation behavior may depend on third-party providers.",
          ],
        },
        {
          title: "Prohibited Use",
          body: [
            "You may not reverse engineer, overload, scrape, resell access without permission, bypass limits, abuse promotions, or interfere with the service.",
            "We may suspend or terminate accounts that violate these Terms, create risk, or attempt payment or credit abuse.",
          ],
        },
        {
          title: "Service Availability",
          body: [
            "The service may be unavailable due to maintenance, provider downtime, rate limits, network issues, or other operational reasons.",
            "We may modify, suspend, or discontinue features as needed to operate the service.",
          ],
        },
        {
          title: "Limitation of Liability",
          body: [
            "The service is provided on an as-is and as-available basis to the maximum extent permitted by law.",
            "We are not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, lost data, or business interruption.",
          ],
        },
      ]}
    />
  );
}

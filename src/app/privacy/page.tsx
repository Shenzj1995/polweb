import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${siteConfig.name}.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description={`This Privacy Policy explains how ${siteConfig.name} collects, uses, and protects information when you use our AI video and image generation services.`}
      lastUpdated="April 29, 2026"
      sections={[
        {
          title: "Information We Collect",
          body: [
            "We collect account information such as your email address, display name, avatar, authentication provider, plan, and credit balance.",
            "We collect usage information related to generation requests, including prompts, selected models, input assets, output assets, task status, timestamps, and billing events.",
            "We may collect technical information such as device type, browser, IP-derived region, log data, cookies, and error diagnostics to operate and secure the service.",
          ],
        },
        {
          title: "How We Use Information",
          body: [
            "We use information to provide authentication, manage credits and subscriptions, process AI generation tasks, store user assets, deliver downloads, prevent abuse, and improve reliability.",
            "We use payment and subscription information to process purchases, grant credits, verify billing status, and handle refunds or disputes.",
          ],
        },
        {
          title: "AI Inputs and Outputs",
          body: [
            "Prompts, uploaded files, and generated outputs may be sent to third-party AI providers only as needed to complete a generation request.",
            "Do not upload sensitive personal information, confidential business data, or content you do not have the right to use.",
          ],
        },
        {
          title: "Third-Party Services",
          body: [
            "We rely on service providers such as Supabase for authentication and database services, Stripe for payments, AI model providers for generation, Cloudflare R2 for storage, and Vercel for hosting.",
            "These providers process information according to their own terms and privacy policies.",
          ],
        },
        {
          title: "Data Retention",
          body: [
            "Free user outputs may be deleted after a limited retention period. Paid plan outputs may be retained longer unless deleted by the user or required by law.",
            "Billing records, fraud prevention records, and transaction logs may be retained as needed for legal, tax, security, and accounting purposes.",
          ],
        },
        {
          title: "Security",
          body: [
            "We use access controls, private storage buckets, signed download URLs, and environment variable secrets to protect user data.",
            "No internet service can guarantee perfect security. If you believe your account or data has been compromised, contact us promptly.",
          ],
        },
        {
          title: "Your Choices",
          body: [
            "You may request access, correction, export, or deletion of your account information by contacting support.",
            "Some information may be retained where required for billing, security, legal compliance, or dispute resolution.",
          ],
        },
      ]}
    />
  );
}

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
      lastUpdated="May 8, 2026"
      sections={[
        {
          title: "Information We Collect",
          body: [
            "We collect account information such as your email address, display name, avatar, authentication provider, plan, and credit balance.",
            "We collect usage information related to generation requests, including prompts, selected models, input assets (uploaded images or videos), output assets (generated images or videos), task status, timestamps, and billing events.",
            "We collect payment-related information including subscription status, billing history, and transaction records. Payment card details are processed directly by our payment processor and are not stored on our servers.",
            "We may collect technical information such as device type, browser, IP-derived region, log data, cookies, and error diagnostics to operate and secure the service.",
          ],
        },
        {
          title: "How We Use Information",
          body: [
            "Authentication: to create and manage your account and login sessions.",
            "AI Generation: to process your prompts, upload your input assets, and deliver generated outputs.",
            "Storage: to store your generated images, videos, and input assets in your account.",
            "Billing: to process subscriptions, credit purchases, refunds, and invoice generation.",
            "Security and Fraud Prevention: to detect abuse, enforce rate limits, and prevent fraudulent activity.",
            "Customer Support: to respond to your inquiries and resolve issues.",
            "Compliance: to meet legal, tax, and regulatory obligations.",
          ],
        },
        {
          title: "AI Inputs and Outputs",
          body: [
            "When you submit a generation request, your prompts and uploaded files are transmitted to third-party AI model providers (such as Replicate, fal.ai, and others) solely for the purpose of completing the generation.",
            "Generated outputs are stored in our cloud storage and associated with your account.",
            "Do not upload sensitive personal information, confidential business data, or content you do not have the right to use.",
          ],
        },
        {
          title: "Third-Party Services",
          body: [
            "We rely on the following categories of third-party services:",
            "Authentication and Database: Supabase (supabase.com) for user authentication and data storage.",
            "AI Model Providers: Replicate (replicate.com), fal.ai, and other providers for AI generation processing.",
            "Payment Processing: DodoPayments (dodopayments.com) or Creem (creem.io) acts as the Merchant of Record, handling payment collection, tax compliance, and refund processing.",
            "Cloud Storage: AWS S3 / Cloudflare R2 for storing generated assets and uploaded files.",
            "Hosting: Vercel (vercel.com) for application hosting and delivery.",
            "These providers process information according to their own terms and privacy policies.",
          ],
        },
        {
          title: "Data Retention",
          body: [
            "Account information is retained for the lifetime of your account and for up to 90 days after deletion to allow for recovery.",
            "Generation records (prompts, model selections, status) are retained for the lifetime of your account for billing and support purposes.",
            "Free plan generated outputs may be deleted after 7 days. Paid plan outputs are retained for the duration of the subscription plus 30 days after cancellation, unless deleted by the user.",
            "Billing records, payment history, and transaction logs are retained for up to 7 years as required for legal, tax, and accounting purposes.",
            "Web server logs and error logs are retained for up to 90 days for debugging and security analysis.",
          ],
        },
        {
          title: "Cookies and Analytics",
          body: [
            "We use essential cookies to maintain your login session and preferences.",
            "We may use analytics tools to understand how users interact with the service, identify performance issues, and improve the product.",
            "Analytics data is aggregated and does not personally identify you.",
            "You can disable cookies in your browser settings, but this may affect the functionality of the service.",
          ],
        },
        {
          title: "Your Rights",
          body: [
            "You may request access to your personal data by contacting support@polzj.com.",
            "You may request correction of inaccurate information by updating your account settings or contacting us.",
            "You may request export of your data (including generation history and assets) by contacting support@polzj.com.",
            "You may request deletion of your account and associated data by contacting support@polzj.com. Some information may be retained where required for billing, security, legal compliance, or dispute resolution.",
          ],
        },
        {
          title: "Security",
          body: [
            "We use access controls, private storage buckets, signed download URLs, and environment variable secrets to protect user data.",
            "No internet service can guarantee perfect security. If you believe your account or data has been compromised, contact us promptly at support@polzj.com.",
          ],
        },
      ]}
    />
  );
}

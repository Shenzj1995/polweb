import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Acceptable Use Policy",
  description: `Acceptable Use Policy for ${siteConfig.name}. Rules for using our AI video and image generation services responsibly.`,
};

export default function AcceptableUsePage() {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      description={`This policy applies to all use of ${siteConfig.name}, including prompts, uploaded images, generated outputs, and account behavior. By using the service, you agree to follow these rules.`}
      lastUpdated="May 7, 2026"
      sections={[
        {
          title: "Scope",
          body: [
            "This policy applies to all content you create, upload, or generate through our service, including text prompts, uploaded images and videos, AI-generated outputs, and any other use of your account.",
            "You are responsible for ensuring that your use of the service complies with all applicable laws and regulations.",
          ],
        },
        {
          title: "Illegal Activity",
          body: [
            "You may not use the service for any illegal purpose, including fraud, phishing, illegal transactions, tax evasion, money laundering, evading law enforcement, or facilitating cyberattacks.",
            "You may not generate content that promotes or instructs others to commit illegal acts.",
          ],
        },
        {
          title: "Adult and NSFW Content",
          body: [
            "You may not generate, upload, or distribute sexually explicit, pornographic, or nude content through the service.",
            "Erotic, fetish, and sexually suggestive content is prohibited regardless of whether it involves real or AI-generated individuals.",
          ],
        },
        {
          title: "Child Safety",
          body: [
            "Any content involving the sexualization, exploitation, grooming,诱导, or abuse of minors is strictly prohibited and will be reported to relevant authorities.",
            "We have zero tolerance for any content that places minors in sexualized, violent, or dangerous contexts.",
          ],
        },
        {
          title: "Non-Consensual Deepfakes and Impersonation",
          body: [
            "You may not create deepfakes, face swaps, or AI-generated content depicting real individuals without their consent.",
            "You may not generate content that impersonates public figures, celebrities, politicians, or private individuals in misleading, defamatory, or harmful ways.",
            "Using someone's likeness, voice, or identity to deceive, harass, defame, or cause harm is prohibited.",
          ],
        },
        {
          title: "Intellectual Property and Copyright",
          body: [
            "You may not use the service to generate content that infringes on trademarks, copyrights, patents, or other intellectual property rights.",
            "You may not generate content featuring protected characters, brands, logos, or copyrighted works without authorization from the rights holder.",
            "You may not use the service to create counterfeit documents, currency, or official seals.",
          ],
        },
        {
          title: "Misleading Content",
          body: [
            "You may not generate content designed to spread political misinformation, fake news, or misleading medical, financial, or legal advice.",
            "You may not create content intended to manipulate markets, defraud consumers, or deceive the public.",
          ],
        },
        {
          title: "Harassment, Hate, and Violence",
          body: [
            "You may not use the service to harass, threaten, bully, intimidate, or stalk any individual or group.",
            "Content that promotes hate, discrimination, or violence based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics is prohibited.",
            "Depicting graphic violence, gore, or real-world violent events with the intent to shock, glorify, or incite is not allowed.",
          ],
        },
        {
          title: "Content Review",
          body: [
            "We may use automated systems and manual review to monitor prompts, uploaded content, and generated outputs for policy compliance.",
            "Content flagged by our safety systems may be blocked, and the associated generation may be canceled before output is delivered.",
            "We reserve the right to review any content at any time to ensure compliance with this policy.",
          ],
        },
        {
          title: "Violations and Enforcement",
          body: [
            "If you violate this policy, we may take action including: refusing or canceling a generation, deleting generated content, issuing a warning, temporarily suspending your account, permanently terminating your account, or declining refund requests related to policy violations.",
            "Serious or repeated violations may result in permanent bans and forfeiture of remaining credits.",
            "We cooperate with law enforcement and may report illegal activity to the appropriate authorities.",
          ],
        },
        {
          title: "User Responsibility",
          body: [
            "You are solely responsible for the prompts you write, the images and files you upload, the AI outputs you generate, and how you use, share, or distribute those outputs.",
            "You must ensure that your use of AI-generated content complies with the laws and regulations of your jurisdiction.",
            "If you are unsure whether a particular use is allowed, contact us before proceeding.",
          ],
        },
        {
          title: "Reporting and Appeals",
          body: [
            `If you encounter content that violates this policy, or if you believe your account was suspended in error, contact us at ${siteConfig.supportEmail}.`,
            "We will review reports and appeals in good faith and respond as promptly as practical.",
          ],
        },
      ]}
    />
  );
}

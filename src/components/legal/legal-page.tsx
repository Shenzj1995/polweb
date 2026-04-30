import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { siteConfig } from "@/config/site";

interface LegalSection {
  title: string;
  body: string[];
}

interface LegalPageProps {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPage({ title, description, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <div className="mb-10 border-b border-border/50 pb-8">
            <p className="mb-3 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
            <h1 className="text-4xl font-bold tracking-normal">{title}</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-9">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <section>
              <h2 className="text-xl font-semibold">Contact</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Questions about this policy can be sent to{" "}
                <a className="text-foreground underline underline-offset-4" href={`mailto:${siteConfig.supportEmail}`}>
                  {siteConfig.supportEmail}
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

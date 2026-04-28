import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { effects } from "@/config/effects";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return Object.keys(effects).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: `AI Effect`,
    description: "Apply stunning AI effects to transform your images and videos.",
  };
}

export default async function EffectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const effect = effects[slug];

  if (!effect) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link href="/effects" className="hover:text-foreground">Effects</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{effect.name}</span>
          </nav>

          {/* Hero */}
          <div className="mb-8 flex flex-col gap-6 lg:flex-row">
            {/* Preview */}
            <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted lg:w-1/2">
              <Sparkles className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="flex flex-col justify-center lg:w-1/2">
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-violet-500/20 text-violet-400">
                  {effect.category}
                </Badge>
                <Badge variant="outline">{effect.creditsCost} credits</Badge>
              </div>
              <h1 className="mb-4 text-3xl font-bold lg:text-4xl">{effect.name}</h1>
              <p className="mb-6 text-muted-foreground">{effect.description}</p>
              <Link
                href="/generate"
                className="inline-flex h-11 w-fit items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-sm font-medium text-white hover:from-violet-600 hover:to-fuchsia-600"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Try this Effect
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">FAQ</h2>
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-medium">How do I use {effect.name}?</h3>
                  <p className="text-sm text-muted-foreground">
                    Simply go to the Generate page, select a supported model, and apply the {effect.name} effect. Upload your content and let AI do the rest.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-medium">How much does {effect.name} cost?</h3>
                  <p className="text-sm text-muted-foreground">
                    {effect.name} costs {effect.creditsCost} credits per use. You get 20 free credits when you sign up.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-medium">Which models support this effect?</h3>
                  <p className="text-sm text-muted-foreground">
                    {effect.name} is available on: {effect.models.join(", ")}.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

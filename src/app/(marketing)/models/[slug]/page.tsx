import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Check } from "lucide-react";
import Link from "next/link";
import { models } from "@/config/models";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return Object.keys(models).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = models[slug];
  return {
    title: model ? `${model.name} - AI Studio` : "AI Model - AI Studio",
    description: model?.description ?? "Generate stunning AI videos and images with the best AI models.",
  };
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = models[slug];

  if (!model) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link href="/models" className="hover:text-foreground">Models</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{model.name}</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-bold">{model.name}</h1>
              {model.isHot && <Badge className="bg-orange-500/20 text-orange-400">Hot</Badge>}
              {model.isNew && <Badge className="bg-green-500/20 text-green-400">New</Badge>}
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl">{model.description}</p>
          </div>

          {/* Quick Generate CTA */}
          <Card className="mb-12 border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h2 className="text-lg font-semibold">Try {model.name} now</h2>
                <p className="text-muted-foreground">Start with 20 free credits</p>
              </div>
              <Link
                href="/generate"
                className="inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-medium text-white hover:from-violet-600 hover:to-fuchsia-600"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with {model.name}
              </Link>
            </CardContent>
          </Card>

          {/* Features */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Key Features</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {model.type.map((t) => (
                <Card key={t} className="border-border/50">
                  <CardContent className="flex items-start gap-3 p-4">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />
                    <div>
                      <h3 className="font-medium">
                        {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Powered by {model.name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Supported Params */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Supported Options</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {model.supportedParams.duration.length > 0 && (
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <h3 className="mb-2 font-medium">Duration</h3>
                    <div className="flex gap-2">
                      {model.supportedParams.duration.map((d) => (
                        <Badge key={d} variant="outline">{d}s</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-medium">Aspect Ratios</h3>
                  <div className="flex flex-wrap gap-2">
                    {model.supportedParams.aspectRatio.map((ar) => (
                      <Badge key={ar} variant="outline">{ar}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-medium">Resolution</h3>
                  <div className="flex flex-wrap gap-2">
                    {model.supportedParams.resolution.map((r) => (
                      <Badge key={r} variant="outline">{r}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">FAQ</h2>
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-medium">Is {model.name} free to use?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! You get 20 free credits when you sign up. Each video generation costs{" "}
                    {model.creditsCost.TEXT_TO_VIDEO || model.creditsCost.IMAGE_TO_VIDEO || 10} credits.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-medium">How long does generation take?</h3>
                  <p className="text-sm text-muted-foreground">
                    Average generation time is about {model.avgGenerationTime} seconds for {model.category} generation.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-medium">What makes {model.name} different?</h3>
                  <p className="text-sm text-muted-foreground">
                    {model.description} Access it directly through AI Studio along with 10+ other top AI models.
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

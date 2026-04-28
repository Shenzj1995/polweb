import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { tools } from "@/config/tools";
import { models } from "@/config/models";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return Object.keys(tools).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return {
    title: `AI Tool`,
    description: "Powerful AI tools for video and image generation.",
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = tools[slug];

  if (!tool) notFound();

  const supportedModels = tool.models
    .map((m) => models[m])
    .filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link href="/tools" className="hover:text-foreground">Tools</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{tool.name}</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold">{tool.name}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">{tool.description}</p>
          </div>

          {/* Quick Generate CTA */}
          <Card className="mb-12 border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h2 className="text-lg font-semibold">Try {tool.name} now</h2>
                <p className="text-muted-foreground">Start with 20 free credits</p>
              </div>
              <Link
                href="/generate"
                className="inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-medium text-white hover:from-violet-600 hover:to-fuchsia-600"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Try it Free
              </Link>
            </CardContent>
          </Card>

          {/* How it Works */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">How it Works</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { step: "1", title: "Input", desc: tool.inputType === "text" ? "Type your description or prompt" : tool.inputType === "image" ? "Upload your image" : "Upload your video" },
                { step: "2", title: "Generate", desc: "AI processes your input and creates the output" },
                { step: "3", title: "Download", desc: "Get your " + tool.outputType + " in high quality" },
              ].map((item) => (
                <Card key={item.step} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 text-sm font-bold text-violet-400">
                      {item.step}
                    </div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Supported Models */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Supported Models</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {supportedModels.map((model) => (
                <Link key={model.id} href={`/models/${model.slug}`}>
                  <Card className="border-border/50 transition-all hover:border-violet-500/50">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Sparkles className="h-5 w-5 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{model.name}</h3>
                        <p className="text-xs text-muted-foreground">{model.provider}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">FAQ</h2>
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-medium">How many credits does {tool.name} cost?</h3>
                  <p className="text-sm text-muted-foreground">
                    {tool.name} costs {tool.creditsCost} credits per generation. You get 20 free credits when you sign up.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-medium">Which models support {tool.name}?</h3>
                  <p className="text-sm text-muted-foreground">
                    {tool.name} is supported by {tool.models.join(", ")}. Each model may produce slightly different results.
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

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { models } from "@/config/models";
import { tools } from "@/config/tools";
import {
  Sparkles,
  VideoIcon,
  ImageIcon,
  ArrowRight,
  Type,
  ImagePlus,
  RefreshCw,
  Film,
  UserRound,
} from "lucide-react";

const toolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  ImagePlay: ImageIcon,
  ImagePlus,
  RefreshCw,
  Film,
  UserRound,
};

export const metadata = {
  title: "Explore - AI Studio",
  description: "Discover AI models, tools, and capabilities. Get inspired and start creating.",
};

export default function ExplorePage() {
  const hotModels = Object.values(models).filter((m) => m.isHot || m.isNew);
  const allTools = Object.values(tools);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Hero */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">Explore</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Discover AI models and tools. One platform, every top model.
            </p>
          </div>

          {/* Hot & New Models */}
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Trending Models</h2>
              <Link href="/models" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300">
                View all models <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hotModels.map((model) => (
                <Link key={model.id} href={`/models/${model.slug}`}>
                  <Card className="group h-full cursor-pointer border-border/50 bg-card/50 transition-all hover:border-violet-500/50 hover:bg-card">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                          {model.category === "video" ? (
                            <VideoIcon className="h-5 w-5 text-violet-400" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-violet-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{model.name}</h3>
                          <div className="flex items-center gap-1">
                            {model.isHot && (
                              <Badge className="bg-orange-500/20 text-orange-400 text-[10px] px-1">Hot</Badge>
                            )}
                            {model.isNew && (
                              <Badge className="bg-green-500/20 text-green-400 text-[10px] px-1">New</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{model.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {model.type.map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">
                            {t.replace(/_/g, " ").toLowerCase()}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{model.provider}</span>
                        <span>~{model.avgGenerationTime}s</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* All Tools */}
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">AI Tools</h2>
              <Link href="/tools" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300">
                View all tools <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allTools.map((tool) => {
                const Icon = toolIcons[tool.icon];
                return (
                  <Link key={tool.id} href={`/tools/${tool.slug}`}>
                    <Card className="group h-full cursor-pointer border-border/50 bg-card/50 transition-all hover:border-violet-500/50 hover:bg-card">
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            tool.category === "video" ? "bg-violet-500/10" : "bg-fuchsia-500/10"
                          }`}>
                            {Icon && <Icon className={`h-5 w-5 ${
                              tool.category === "video" ? "text-violet-400" : "text-fuchsia-400"
                            }`} />}
                          </div>
                          <div>
                            <h3 className="font-semibold">{tool.name}</h3>
                            <Badge variant="outline" className="text-[10px]">{tool.creditsCost} credits</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {tool.models.map((m) => {
                            const model = models[m];
                            return (
                              <Badge key={m} variant="secondary" className="text-[10px]">
                                {model?.name ?? m}
                              </Badge>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* CTA */}
          <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h2 className="text-xl font-bold">Ready to create?</h2>
                <p className="text-muted-foreground">Start with 20 free credits. No credit card required.</p>
              </div>
              <Link
                href="/generate"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-sm font-medium text-white hover:from-violet-600 hover:to-fuchsia-600"
              >
                <Sparkles className="h-4 w-4" /> Start Generating
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

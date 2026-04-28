import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { effects } from "@/config/effects";
import { Sparkles, Wand2, Zap, Paintbrush } from "lucide-react";

const categoryConfig = {
  style: { label: "Style Transfer", icon: Paintbrush, color: "text-violet-400" },
  enhance: { label: "Enhancement", icon: Zap, color: "text-amber-400" },
  creative: { label: "Creative Effects", icon: Wand2, color: "text-fuchsia-400" },
} as const;

export default function EffectsPage() {
  const grouped = {
    style: Object.values(effects).filter((e) => e.category === "style"),
    enhance: Object.values(effects).filter((e) => e.category === "enhance"),
    creative: Object.values(effects).filter((e) => e.category === "creative"),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Hero */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">AI Effects</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Apply stunning AI effects to transform your images and videos. From artistic styles to creative enhancements.
            </p>
          </div>

          {/* Categories */}
          {(Object.entries(grouped) as [keyof typeof categoryConfig, typeof effects[string][]][]).map(
            ([category, effectList]) => {
              const config = categoryConfig[category];
              const Icon = config.icon;
              return (
                <section key={category} className="mb-12">
                  <div className="mb-6 flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <h2 className="text-2xl font-bold">{config.label}</h2>
                    <Badge variant="secondary" className="text-xs">
                      {effectList.length}
                    </Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {effectList.map((effect) => (
                      <Link key={effect.id} href={`/effects/${effect.slug}`}>
                        <Card className="group h-full cursor-pointer border-border/50 bg-card/50 transition-all hover:border-violet-500/50 hover:bg-card">
                          <CardContent className="p-5">
                            {/* Thumbnail placeholder */}
                            <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-muted">
                              <Sparkles className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold">{effect.name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {effect.description}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <Badge variant="outline" className="text-[10px]">
                                {effect.creditsCost} credits
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {effect.models.length} model{effect.models.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            }
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

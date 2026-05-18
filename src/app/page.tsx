import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GenerateForm } from "@/components/generate/generate-form";
import { HistoryGallery } from "@/components/generate/history-gallery";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { models } from "@/config/models";

const hotModels = Object.values(models).filter((m) => m.isHot || m.isNew).slice(0, 6);

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero + Generate Form */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Create the World{" "}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  You Imagine
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                All-in-one AI video and image generation. One subscription, every top model.
              </p>
            </div>
            <GenerateForm />
          </div>
        </section>

        <HistoryGallery />

        {/* Featured Models */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Featured Models</h2>
              <p className="text-muted-foreground">The best AI models, all in one place</p>
            </div>
            <Link
              href="/models"
              className="text-sm text-violet-400 hover:text-violet-300"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotModels.map((model) => (
              <Link key={model.id} href={`/models/${model.slug}`}>
                <Card className="group cursor-pointer border-border/50 bg-card/50 transition-all hover:border-violet-500/50 hover:bg-card">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <h3 className="font-semibold">{model.name}</h3>
                      {model.isHot && (
                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 text-[10px]">
                          Hot
                        </Badge>
                      )}
                      {model.isNew && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-[10px]">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{model.description}</p>
                    <div className="mt-3 flex gap-2">
                      {model.type.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px]">
                          {t.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/40 bg-gradient-to-b from-transparent to-violet-500/5">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
            <h2 className="mb-4 text-3xl font-bold">Ready to create?</h2>
            <p className="mb-8 text-muted-foreground">
              Join thousands of creators using AI Studio to bring their ideas to life.
            </p>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 text-base font-medium text-white hover:from-violet-600 hover:to-fuchsia-600"
            >
              Start for Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

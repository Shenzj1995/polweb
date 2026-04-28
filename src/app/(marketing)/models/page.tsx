import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { models } from "@/config/models";

export const metadata = {
  title: "AI Models - Video & Image Generation",
  description: "Explore all AI video and image generation models available on AI Studio.",
};

export default function ModelsPage() {
  const videoModels = Object.values(models).filter((m) => m.category === "video");
  const imageModels = Object.values(models).filter((m) => m.category === "image");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">AI Model Directory</h1>
            <p className="text-lg text-muted-foreground">
              Every top AI model, one subscription. No need to switch between platforms.
            </p>
          </div>

          {/* Video Models */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Video Models</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videoModels.map((model) => (
                <Link key={model.id} href={`/models/${model.slug}`}>
                  <Card className="group cursor-pointer border-border/50 bg-card/50 transition-all hover:border-violet-500/50 hover:bg-card">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <h3 className="font-semibold">{model.name}</h3>
                        {model.isHot && (
                          <Badge className="bg-orange-500/20 text-orange-400 text-[10px]">Hot</Badge>
                        )}
                        {model.isNew && (
                          <Badge className="bg-green-500/20 text-green-400 text-[10px]">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{model.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
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

          {/* Image Models */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">Image Models</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imageModels.map((model) => (
                <Link key={model.id} href={`/models/${model.slug}`}>
                  <Card className="group cursor-pointer border-border/50 bg-card/50 transition-all hover:border-violet-500/50 hover:bg-card">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <h3 className="font-semibold">{model.name}</h3>
                        {model.isHot && (
                          <Badge className="bg-orange-500/20 text-orange-400 text-[10px]">Hot</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{model.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { tools } from "@/config/tools";
import {
  Type,
  ImageIcon,
  Film,
  RefreshCw,
  UserRound,
  ImagePlus,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  ImagePlay: ImageIcon,
  ImagePlus,
  RefreshCw,
  Film,
  UserRound,
};

const videoTools = Object.values(tools).filter((t) => t.category === "video");
const imageTools = Object.values(tools).filter((t) => t.category === "image");

export default function ToolsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Hero */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">AI Tools</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Powerful AI tools for video and image generation. From text-to-video to image transformation.
            </p>
          </div>

          {/* Video Tools */}
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-2">
              <Film className="h-5 w-5 text-violet-400" />
              <h2 className="text-2xl font-bold">Video Tools</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videoTools.map((tool) => {
                const Icon = iconMap[tool.icon];
                return (
                  <Link key={tool.id} href={`/tools/${tool.slug}`}>
                    <Card className="group h-full cursor-pointer border-border/50 bg-card/50 transition-all hover:border-violet-500/50 hover:bg-card">
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                            {Icon && <Icon className="h-5 w-5 text-violet-400" />}
                          </div>
                          <div>
                            <h3 className="font-semibold">{tool.name}</h3>
                            <Badge variant="outline" className="text-[10px]">
                              {tool.creditsCost} credits
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tool.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {tool.models.map((m) => (
                            <Badge key={m} variant="secondary" className="text-[10px]">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Image Tools */}
          <section>
            <div className="mb-6 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-2xl font-bold">Image Tools</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imageTools.map((tool) => {
                const Icon = iconMap[tool.icon];
                return (
                  <Link key={tool.id} href={`/tools/${tool.slug}`}>
                    <Card className="group h-full cursor-pointer border-border/50 bg-card/50 transition-all hover:border-violet-500/50 hover:bg-card">
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/10">
                            {Icon && <Icon className="h-5 w-5 text-fuchsia-400" />}
                          </div>
                          <div>
                            <h3 className="font-semibold">{tool.name}</h3>
                            <Badge variant="outline" className="text-[10px]">
                              {tool.creditsCost} credits
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tool.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {tool.models.map((m) => (
                            <Badge key={m} variant="secondary" className="text-[10px]">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

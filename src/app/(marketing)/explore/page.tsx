import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Eye, VideoIcon, ImageIcon } from "lucide-react";

// Placeholder community content
const communityPosts = [
  {
    id: "1",
    type: "video",
    prompt: "A samurai walking through cherry blossoms in slow motion",
    model: "Kling AI",
    author: "creative_viz",
    likes: 234,
    views: 1820,
  },
  {
    id: "2",
    type: "image",
    prompt: "Steampunk clockwork city with airships, golden hour",
    model: "FLUX Pro",
    author: "ai_artistry",
    likes: 189,
    views: 1450,
  },
  {
    id: "3",
    type: "video",
    prompt: "Ocean waves crashing on crystal rocks, drone shot",
    model: "Seedance 2.0",
    author: "nature_lens",
    likes: 312,
    views: 2340,
  },
  {
    id: "4",
    type: "image",
    prompt: "Portrait of a futuristic warrior with neon armor",
    model: "FLUX Pro",
    author: "digital_realm",
    likes: 156,
    views: 980,
  },
  {
    id: "5",
    type: "video",
    prompt: "Time-lapse of Northern Lights over Icelandic mountains",
    model: "Runway Gen-3",
    author: "astro_visuals",
    likes: 445,
    views: 3120,
  },
  {
    id: "6",
    type: "image",
    prompt: "Victorian garden party with magical creatures",
    model: "Stable Diffusion 3",
    author: "whimsical_ai",
    likes: 201,
    views: 1560,
  },
  {
    id: "7",
    type: "video",
    prompt: "Underwater bioluminescent creatures in deep ocean",
    model: "Luma AI",
    author: "deep_blue",
    likes: 278,
    views: 2100,
  },
  {
    id: "8",
    type: "image",
    prompt: "Miniature world inside a snow globe, macro photography",
    model: "FLUX Schnell",
    author: "tiny_worlds",
    likes: 167,
    views: 1230,
  },
];

export default function ExplorePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Hero */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">Explore</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Discover amazing AI creations from the community. Get inspired and create your own.
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {communityPosts.map((post) => (
              <Card
                key={post.id}
                className="group cursor-pointer overflow-hidden border-border/50 transition-all hover:border-violet-500/50"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {post.type === "video" ? (
                      <VideoIcon className="h-10 w-10 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-xs text-white line-clamp-2">{post.prompt}</p>
                  </div>
                  {post.type === "video" && (
                    <Badge className="absolute left-2 top-2 bg-black/60 text-white backdrop-blur-sm">
                      <VideoIcon className="mr-1 h-3 w-3" /> Video
                    </Badge>
                  )}
                </div>

                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">@{post.author}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {post.views}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-2 text-[10px]">
                    {post.model}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

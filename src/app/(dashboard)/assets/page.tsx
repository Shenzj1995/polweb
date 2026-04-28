import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, VideoIcon, Download, Trash2 } from "lucide-react";
import Link from "next/link";

// Placeholder — will be replaced with real data
const placeholderAssets = [
  { id: "1", type: "video", prompt: "Golden retriever on beach", model: "Kling AI", date: "2 hours ago" },
  { id: "2", type: "image", prompt: "Cyberpunk cityscape", model: "FLUX Pro", date: "5 hours ago" },
  { id: "3", type: "video", prompt: "Underwater coral reef", model: "Seedance 2.0", date: "1 day ago" },
  { id: "4", type: "image", prompt: "Medieval castle on cliff", model: "FLUX Schnell", date: "1 day ago" },
  { id: "5", type: "video", prompt: "Astronaut floating in space", model: "Runway Gen-3", date: "2 days ago" },
  { id: "6", type: "image", prompt: "Cherry blossom garden in Kyoto", model: "Stable Diffusion 3", date: "3 days ago" },
];

export default function AssetsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Assets</h1>
          <p className="text-muted-foreground">Your generated videos and images</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <VideoIcon className="h-3 w-3" /> 3 videos
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <ImageIcon className="h-3 w-3" /> 3 images
          </Badge>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderAssets.map((asset) => (
          <Card
            key={asset.id}
            className="group cursor-pointer border-border/50 overflow-hidden transition-all hover:border-violet-500/50"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                {asset.type === "video" ? (
                  <VideoIcon className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="rounded-full bg-white/20 p-2 backdrop-blur-sm hover:bg-white/30">
                  <Download className="h-4 w-4 text-white" />
                </button>
                <button className="rounded-full bg-white/20 p-2 backdrop-blur-sm hover:bg-red-500/50">
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              </div>
              {asset.type === "video" && (
                <Badge className="absolute bottom-2 left-2 bg-black/60 text-white backdrop-blur-sm">
                  <VideoIcon className="mr-1 h-3 w-3" /> Video
                </Badge>
              )}
            </div>

            <CardContent className="p-3">
              <p className="truncate text-sm font-medium">{asset.prompt}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{asset.model}</span>
                <span>&middot;</span>
                <span>{asset.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Your generated content will appear here.</p>
        <p className="mt-1">
          <Link href="/generate" className="text-violet-400 hover:text-violet-300">
            Start creating &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}

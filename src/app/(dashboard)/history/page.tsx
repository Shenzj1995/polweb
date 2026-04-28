import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Sparkles, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const statusConfig = {
  PROCESSING: {
    icon: Loader2,
    label: "Processing",
    className: "bg-blue-500/20 text-blue-400",
    iconClass: "animate-spin",
  },
  COMPLETED: {
    icon: CheckCircle,
    label: "Completed",
    className: "bg-green-500/20 text-green-400",
    iconClass: "",
  },
  FAILED: {
    icon: AlertCircle,
    label: "Failed",
    className: "bg-red-500/20 text-red-400",
    iconClass: "",
  },
  PENDING: {
    icon: Clock,
    label: "Queued",
    className: "bg-yellow-500/20 text-yellow-400",
    iconClass: "",
  },
} as const;

// Placeholder data — will be replaced with real data from API
const placeholderGenerations = [
  {
    id: "1",
    type: "TEXT_TO_VIDEO",
    model: "kling-ai",
    prompt: "A golden retriever running on a beach at sunset, cinematic",
    status: "COMPLETED" as const,
    createdAt: "2 hours ago",
    creditsCost: 10,
  },
  {
    id: "2",
    type: "TEXT_TO_IMAGE",
    model: "flux-pro",
    prompt: "Cyberpunk cityscape with neon lights",
    status: "COMPLETED" as const,
    createdAt: "5 hours ago",
    creditsCost: 3,
  },
  {
    id: "3",
    type: "TEXT_TO_VIDEO",
    model: "seedance-2",
    prompt: "Underwater coral reef with tropical fish",
    status: "PROCESSING" as const,
    createdAt: "Just now",
    creditsCost: 10,
  },
];

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-muted-foreground">Your recent generations</p>
        </div>
        <Link
          href="/generate"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-medium text-white hover:from-violet-600 hover:to-fuchsia-600"
        >
          <Sparkles className="h-4 w-4" />
          New Generation
        </Link>
      </div>

      {/* Generation List */}
      <div className="space-y-3">
        {placeholderGenerations.map((gen) => {
          const status = statusConfig[gen.status];
          const StatusIcon = status.icon;

          return (
            <Card key={gen.id} className="border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                {/* Thumbnail Placeholder */}
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {gen.prompt}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{gen.model}</span>
                    <span>&middot;</span>
                    <span>{gen.type.replace(/_/g, " ").toLowerCase()}</span>
                    <span>&middot;</span>
                    <span>{gen.creditsCost} credits</span>
                    <span>&middot;</span>
                    <span>{gen.createdAt}</span>
                  </div>
                </div>

                {/* Status */}
                <Badge variant="secondary" className={status.className}>
                  <StatusIcon className={`mr-1 h-3 w-3 ${status.iconClass}`} />
                  {status.label}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State Hint */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>History will appear here after you generate content.</p>
        <p className="mt-1">
          <Link href="/generate" className="text-violet-400 hover:text-violet-300">
            Start creating &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}

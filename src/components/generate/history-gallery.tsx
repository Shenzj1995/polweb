"use client";

/* eslint-disable @next/next/no-img-element -- Images are dynamic AI-generated content with unknown external URLs */

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  ImageIcon,
  VideoIcon,
  Play,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface GenItem {
  id: string;
  type: string;
  model: string;
  prompt: string | null;
  status: string;
  creditsCost: number;
  outputUrl: string | null;
  outputType: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function HistoryGallery() {
  const [items, setItems] = useState<GenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<GenItem | null>(null);

  useEffect(() => {
    fetch("/api/generate/history?limit=12")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items) setItems(data.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Recent Generations</h2>
        </div>
        <Link
          href="/history"
          className="text-sm text-violet-400 hover:text-violet-300"
        >
          View all &rarr;
        </Link>
      </div>

      <div className="space-y-3">
        {items
          .filter((item) => item.outputUrl)
          .map((item) => (
            <Card
              key={item.id}
              className="group cursor-pointer overflow-hidden border-border/50 bg-card/50 transition-all hover:border-primary/30"
              onClick={() => setPreview(item)}
            >
              <div className="flex items-center gap-3 p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.outputUrl ? (
                    item.outputType === "video" ? (
                      <div className="relative flex h-full w-full items-center justify-center">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <VideoIcon className="h-5 w-5 text-muted-foreground/60" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-6 w-6 text-white/70 drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.outputUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute right-0.5 top-0.5">
                    {item.status === "SUCCEEDED" ? (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    ) : item.status === "FAILED" ? (
                      <AlertCircle className="h-3 w-3 text-red-400" />
                    ) : (
                      <Clock className="h-3 w-3 text-yellow-400" />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{item.model}</span>
                    <Badge
                      variant="secondary"
                      className="shrink-0 bg-muted/50 text-[10px] text-muted-foreground"
                    >
                      {item.type.replace(/_/g, " ").toLowerCase()}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground/70">
                    {item.prompt || "No prompt"}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground/50">
                    <span>{timeAgo(item.createdAt)}</span>
                    <span>&middot;</span>
                    <span>{item.creditsCost}c</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-3xl">
          {preview && (
            <>
              <DialogTitle>
                {preview.prompt || preview.type.replace(/_/g, " ").toLowerCase()}
              </DialogTitle>
              <DialogDescription>
                {preview.model} &middot;{" "}
                {preview.type.replace(/_/g, " ").toLowerCase()} &middot;{" "}
                {preview.creditsCost} credits &middot; {timeAgo(preview.createdAt)}
              </DialogDescription>
              <div className="mt-2 overflow-hidden rounded-lg bg-muted">
                {preview.outputType === "video" ? (
                  <video
                    src={preview.outputUrl!}
                    controls
                    className="max-h-[70vh] w-full object-contain"
                  />
                ) : (
                  <img
                    src={preview.outputUrl!}
                    alt=""
                    className="max-h-[70vh] w-full object-contain"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => window.open(preview.outputUrl!, "_blank")}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
                >
                  <ExternalLink className="h-4 w-4" /> Open
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

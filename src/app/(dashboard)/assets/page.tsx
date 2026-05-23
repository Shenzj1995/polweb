"use client";

/* eslint-disable @next/next/no-img-element -- Images are dynamic AI-generated content with unknown external URLs */

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  VideoIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";

type MediaFilter = "all" | "image" | "video";

interface AssetItem {
  id: string;
  kind: string;
  mediaType: "image" | "video";
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  createdAt: string;
  url: string | null;
  generation: {
    prompt: string | null;
    model: string;
    type: string;
  } | null;
}

function timeAgo(dateStr: string, nowMs: number) {
  const seconds = Math.floor((nowMs - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatBytes(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AssetsPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<AssetItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [loading, setLoading] = useState(false);
  const [nowMs] = useState(() => Date.now());
  const limit = 12;

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (filter !== "all") params.set("mediaType", filter);

    Promise.resolve()
      .then(() => {
        setLoading(true);
        return fetch(`/api/user/assets?${params.toString()}`, { signal: controller.signal });
      })
      .then((res) => (res.ok ? res.json() : { items: [], total: 0 }))
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filter, page, user]);

  const totalPages = Math.ceil(total / limit);
  const title = useMemo(() => {
    if (filter === "image") return "Images";
    if (filter === "video") return "Videos";
    return "My Assets";
  }, [filter]);

  const setMediaFilter = (nextFilter: MediaFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">My Assets</h1>
        <p className="mb-6 text-muted-foreground">Sign in to view your generated videos and images.</p>
        <Link
          href="/login?redirect=/assets"
          className="inline-flex h-10 items-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-sm font-medium text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            {total > 0 ? `${total} asset${total !== 1 ? "s" : ""}` : "Your generated videos and images"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["all", "image", "video"] as const).map((value) => (
            <Button
              key={value}
              variant={filter === value ? "default" : "outline"}
              size="sm"
              onClick={() => setMediaFilter(value)}
              className={filter === value ? "bg-violet-500 text-white hover:bg-violet-600" : ""}
            >
              {value === "image" && <ImageIcon className="mr-1 h-3 w-3" />}
              {value === "video" && <VideoIcon className="mr-1 h-3 w-3" />}
              {value === "all" ? "All" : value === "image" ? "Images" : "Videos"}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold">No assets yet</h2>
          <p className="mb-6 text-muted-foreground">Generated outputs will appear here after a job completes.</p>
          <Link href="/generate" className="text-violet-400 hover:text-violet-300">
            Start creating &rarr;
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((asset) => {
              const prompt = asset.generation?.prompt || `${asset.mediaType} asset`;
              const size = formatBytes(asset.sizeBytes);

              return (
                <Card
                  key={asset.id}
                  className="group overflow-hidden border-border/50 transition-all hover:border-violet-500/50"
                >
                  <div className="relative aspect-video bg-muted">
                    {asset.url && asset.mediaType === "video" ? (
                      <video src={asset.url} className="h-full w-full object-cover" muted playsInline />
                    ) : asset.url ? (
                      <img src={asset.url} alt={prompt} className="h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {asset.mediaType === "video" ? (
                          <VideoIcon className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    )}

                    <Badge className="absolute bottom-2 left-2 bg-black/60 text-white backdrop-blur-sm">
                      {asset.mediaType === "video" ? (
                        <VideoIcon className="mr-1 h-3 w-3" />
                      ) : (
                        <ImageIcon className="mr-1 h-3 w-3" />
                      )}
                      {asset.mediaType}
                    </Badge>

                    {asset.url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center gap-2 rounded-md bg-white/20 px-4 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-3">
                    <p className="truncate text-sm font-medium">{prompt}</p>
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {asset.generation?.model && <span>{asset.generation.model}</span>}
                      {asset.generation?.type && (
                        <>
                          <span>&middot;</span>
                          <span>{asset.generation.type.replace(/_/g, " ").toLowerCase()}</span>
                        </>
                      )}
                      {size && (
                        <>
                          <span>&middot;</span>
                          <span>{size}</span>
                        </>
                      )}
                      <span>&middot;</span>
                      <span>{timeAgo(asset.createdAt, nowMs)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev
              </Button>
              <span className="px-3 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

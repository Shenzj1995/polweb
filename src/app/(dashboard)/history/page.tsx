"use client";

/* eslint-disable @next/next/no-img-element -- Images are dynamic AI-generated content with unknown external URLs */

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Sparkles, AlertCircle, CheckCircle, Loader2, ChevronLeft, ChevronRight, Download, VideoIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const statusConfig: Record<string, { icon: typeof Loader2; label: string; className: string; iconClass: string }> = {
  PROCESSING: { icon: Loader2, label: "Processing", className: "bg-blue-500/20 text-blue-400", iconClass: "animate-spin" },
  SUCCEEDED: { icon: CheckCircle, label: "Completed", className: "bg-green-500/20 text-green-400", iconClass: "" },
  FAILED: { icon: AlertCircle, label: "Failed", className: "bg-red-500/20 text-red-400", iconClass: "" },
  PENDING: { icon: Clock, label: "Queued", className: "bg-yellow-500/20 text-yellow-400", iconClass: "" },
  CANCELLED: { icon: AlertCircle, label: "Cancelled", className: "bg-muted/20 text-muted-foreground", iconClass: "" },
};

interface GenerationItem {
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
  completedAt: string | null;
}

function timeAgo(dateStr: string, nowMs: number) {
  const seconds = Math.floor((nowMs - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<GenerationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nowMs] = useState(() => Date.now());
  const [preview, setPreview] = useState<GenerationItem | null>(null);
  const limit = 10;

  useEffect(() => {
    if (!user) return;

    Promise.resolve()
      .then(() => {
        setLoading(true);
        return fetch(`/api/generate/history?page=${page}&limit=${limit}`);
      })
      .then((res) => (res.ok ? res.json() : { items: [], total: 0 }))
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, page]);

  const totalPages = Math.ceil(total / limit);

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
        <h1 className="mb-2 text-2xl font-bold">History</h1>
        <p className="mb-6 text-muted-foreground">Sign in to view your generation history.</p>
        <Link
          href="/login?redirect=/history"
          className="inline-flex h-10 items-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-sm font-medium text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-muted-foreground">
            {total > 0 ? `${total} generation${total !== 1 ? "s" : ""}` : "Your recent generations"}
          </p>
        </div>
        <Link
          href="/generate"
          className="inline-flex h-9 items-center gap-2 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-medium text-white hover:from-violet-600 hover:to-fuchsia-600"
        >
          <Sparkles className="h-4 w-4" />
          New Generation
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold">No generations yet</h2>
          <p className="mb-6 text-muted-foreground">
            Your generation history will appear here.
          </p>
          <Link
            href="/generate"
            className="text-violet-400 hover:text-violet-300"
          >
            Start creating &rarr;
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((gen) => {
              const status = statusConfig[gen.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;

              return (
                <Card
                  key={gen.id}
                  className="cursor-pointer border-border/50 transition-colors hover:border-violet-500/30"
                  onClick={() => gen.outputUrl && setPreview(gen)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                      {gen.outputUrl ? (
                        gen.outputType === "video" ? (
                          gen.thumbnailUrl ? (
                            <img src={gen.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <VideoIcon className="h-6 w-6 text-muted-foreground" />
                          )
                        ) : (
                          <img src={gen.outputUrl} alt="" className="h-full w-full object-cover" />
                        )
                      ) : (
                        <Sparkles className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {gen.prompt || `${gen.type.replace(/_/g, " ").toLowerCase()}`}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{gen.model}</span>
                        <span>&middot;</span>
                        <span>{gen.type.replace(/_/g, " ").toLowerCase()}</span>
                        <span>&middot;</span>
                        <span>{gen.creditsCost} credits</span>
                        <span>&middot;</span>
                        <span>{timeAgo(gen.createdAt, nowMs)}</span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-sm disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="px-3 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-sm disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-3xl">
          {preview && (
            <>
              <DialogTitle>{preview.prompt || preview.type.replace(/_/g, " ").toLowerCase()}</DialogTitle>
              <DialogDescription>
                {preview.model} &middot; {preview.type.replace(/_/g, " ").toLowerCase()} &middot; {preview.creditsCost} credits
              </DialogDescription>
              <div className="mt-2 overflow-hidden rounded-lg bg-muted">
                {preview.outputType === "video" ? (
                  <video src={preview.outputUrl!} controls className="max-h-[70vh] w-full object-contain" />
                ) : (
                  <img src={preview.outputUrl!} alt="" className="max-h-[70vh] w-full object-contain" />
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => window.open(preview.outputUrl!, "_blank")}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

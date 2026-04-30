"use client";

import { useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Upload,
  ImageIcon,
  VideoIcon,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { getModelsByCategory } from "@/config/models";
import { useGeneration } from "@/hooks/use-generation";
import { useUpload } from "@/hooks/use-upload";
import { useAuth } from "@/lib/supabase/auth-context";
import Link from "next/link";

export function GenerateForm() {
  const [prompt, setPrompt] = useState("");
  const [selectedVideoModel, setSelectedVideoModel] = useState("kling-ai");
  const [selectedImageModel, setSelectedImageModel] = useState("flux-schnell");
  const [activeTab, setActiveTab] = useState("video");
  const [duration, setDuration] = useState("5");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [inputImageUrl, setInputImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const generation = useGeneration();
  const upload = useUpload();

  const videoModels = useMemo(() => getModelsByCategory("video"), []);
  const imageModels = useMemo(() => getModelsByCategory("image"), []);
  const selectedModel = activeTab === "video" ? selectedVideoModel : selectedImageModel;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload.upload(file);
    if (result?.url) {
      setInputImageUrl(result.url);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!user) {
      window.location.href = "/login?redirect=/generate";
      return;
    }

    const genType = activeTab === "video"
      ? (inputImageUrl ? "IMAGE_TO_VIDEO" : "TEXT_TO_VIDEO")
      : "TEXT_TO_IMAGE";

    await generation.submit({
      type: genType,
      model: selectedModel,
      prompt,
      imageUrl: activeTab === "video" ? inputImageUrl || undefined : undefined,
      params: {
        duration,
        aspectRatio,
      },
    });
  };

  const isBusy = generation.submitting || generation.status === "PENDING" || generation.status === "PROCESSING";

  // Show result after generation completes
  if (generation.status === "SUCCEEDED" && generation.outputUrl) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <h3 className="font-semibold">Generation Complete</h3>
          </div>

          {/* Result Preview */}
          <div className="mb-4 overflow-hidden rounded-lg bg-muted">
            {generation.outputType === "video" ? (
              <video
                src={generation.outputUrl}
                controls
                className="max-h-[400px] w-full object-contain"
              />
            ) : (
              <img
                src={generation.outputUrl}
                alt="Generated output"
                className="max-h-[400px] w-full object-contain"
              />
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(generation.outputUrl!, "_blank")}
              className="gap-2"
            >
              <Download className="h-4 w-4" /> Download
            </Button>
            <Button
              variant="outline"
              onClick={generation.reset}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" /> Generate Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error
  if (generation.status === "FAILED" && generation.errorMessage) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h3 className="font-semibold text-red-400">Generation Failed</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">{generation.errorMessage}</p>
          {generation.creditsCost !== null && (
            <p className="mb-4 text-xs text-muted-foreground">
              Credits have been refunded.
            </p>
          )}
          <Button variant="outline" onClick={generation.reset} className="gap-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show progress during generation
  if (isBusy) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
            <div>
              <h3 className="font-semibold">
                {generation.status === "PENDING" ? "Queuing..." : "Generating..."}
              </h3>
              <p className="text-sm text-muted-foreground">
                {generation.creditsCost && `-${generation.creditsCost} credits`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: "60%" }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            AI is creating your {activeTab === "video" ? "video" : "image"}. This usually takes 30-120 seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full justify-start bg-muted/50 p-1">
          <TabsTrigger value="video" className="gap-2">
            <VideoIcon className="h-4 w-4" /> AI Video
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2">
            <ImageIcon className="h-4 w-4" /> AI Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="space-y-4">
          {/* Prompt Input */}
          <div className="relative">
            <Textarea
              placeholder="Describe the video you want to create..."
              className="min-h-[120px] resize-none border-border/50 bg-card/50 pr-4 text-base placeholder:text-muted-foreground/60 focus-visible:ring-violet-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={upload.uploading}
                >
                  {upload.uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {inputImageUrl ? "Change Reference" : "Upload Reference Image"}
                </Button>
                {inputImageUrl && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <ImageIcon className="h-3 w-3" /> Reference set
                    <button
                      onClick={() => setInputImageUrl(null)}
                      className="ml-1 rounded-full hover:bg-accent"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {user ? null : <Link href="/login" className="text-violet-400 hover:underline">Sign in</Link>}
              </span>
            </div>
          </div>

          {/* Settings Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedVideoModel} onValueChange={(v) => v && setSelectedVideoModel(v)}>
              <SelectTrigger className="w-[180px] bg-card/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {videoModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <span className="flex items-center gap-2">
                      {model.name}
                      {model.isHot && (
                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 text-[10px] px-1">
                          Hot
                        </Badge>
                      )}
                      {model.isNew && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-[10px] px-1">
                          New
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={duration} onValueChange={(v) => v && setDuration(v)}>
              <SelectTrigger className="w-[80px] bg-card/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5s</SelectItem>
                <SelectItem value="10">10s</SelectItem>
              </SelectContent>
            </Select>

            <Select value={aspectRatio} onValueChange={(v) => v && setAspectRatio(v)}>
              <SelectTrigger className="w-[80px] bg-card/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="9:16">9:16</SelectItem>
                <SelectItem value="1:1">1:1</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="lg"
              className="ml-auto bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600"
              disabled={!prompt.trim()}
              onClick={handleGenerate}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Describe the image you want to create..."
              className="min-h-[120px] resize-none border-border/50 bg-card/50 pr-4 text-base placeholder:text-muted-foreground/60 focus-visible:ring-violet-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedImageModel} onValueChange={(v) => v && setSelectedImageModel(v)}>
              <SelectTrigger className="w-[180px] bg-card/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {imageModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={aspectRatio} onValueChange={(v) => v && setAspectRatio(v)}>
              <SelectTrigger className="w-[80px] bg-card/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1</SelectItem>
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="9:16">9:16</SelectItem>
                <SelectItem value="3:2">3:2</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="lg"
              className="ml-auto bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600"
              disabled={!prompt.trim()}
              onClick={handleGenerate}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

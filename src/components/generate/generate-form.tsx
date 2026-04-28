"use client";

import { useState } from "react";
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
import { Sparkles, Upload, ImageIcon, VideoIcon } from "lucide-react";
import { getModelsByCategory } from "@/config/models";

export function GenerateForm() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("kling-ai");
  const [activeTab, setActiveTab] = useState("video");
  const [duration, setDuration] = useState("5");
  const [aspectRatio, setAspectRatio] = useState("16:9");

  const videoModels = getModelsByCategory("video");
  const imageModels = getModelsByCategory("image");

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
            />
            <div className="mt-2 flex items-center justify-between">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Upload className="h-4 w-4" /> Upload Reference Image
              </Button>
            </div>
          </div>

          {/* Settings Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedModel} onValueChange={(v) => v && setSelectedModel(v)}>
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
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedModel} onValueChange={(v) => v && setSelectedModel(v)}>
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

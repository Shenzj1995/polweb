export interface ToolConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: "video" | "image";
  inputType: "text" | "image" | "video";
  outputType: "video" | "image";
  icon: string;
  models: string[];
  creditsCost: number;
}

export const tools: Record<string, ToolConfig> = {
  "text-to-video": {
    id: "text-to-video",
    name: "Text to Video",
    slug: "text-to-video",
    description: "Transform text descriptions into cinematic AI videos. Just type what you want to see and let AI create stunning video content.",
    category: "video",
    inputType: "text",
    outputType: "video",
    icon: "Type",
    models: ["kling-ai", "seedance-2", "runway-gen3", "luma-ai"],
    creditsCost: 10,
  },
  "image-to-video": {
    id: "image-to-video",
    name: "Image to Video",
    slug: "image-to-video",
    description: "Bring any image to life with AI-powered video generation. Upload a photo and watch it animate into a cinematic video.",
    category: "video",
    inputType: "image",
    outputType: "video",
    icon: "ImagePlay",
    models: ["kling-ai", "seedance-2", "runway-gen3", "luma-ai"],
    creditsCost: 10,
  },
  "text-to-image": {
    id: "text-to-image",
    name: "Text to Image",
    slug: "text-to-image",
    description: "Generate stunning images from text descriptions. Create artwork, photos, illustrations, and more with AI.",
    category: "image",
    inputType: "text",
    outputType: "image",
    icon: "ImagePlus",
    models: ["flux-schnell", "flux-pro", "stable-diffusion-3"],
    creditsCost: 1,
  },
  "image-to-image": {
    id: "image-to-image",
    name: "Image to Image",
    slug: "image-to-image",
    description: "Transform existing images into new creations using AI. Change style, content, or enhance quality while preserving composition.",
    category: "image",
    inputType: "image",
    outputType: "image",
    icon: "RefreshCw",
    models: ["stable-diffusion-3"],
    creditsCost: 1,
  },
  "video-to-video": {
    id: "video-to-video",
    name: "Video to Video",
    slug: "video-to-video",
    description: "Transform and restyle existing videos using AI. Change the visual style, enhance quality, or apply artistic effects.",
    category: "video",
    inputType: "video",
    outputType: "video",
    icon: "Film",
    models: ["kling-ai", "runway-gen3"],
    creditsCost: 12,
  },
  "ai-avatar": {
    id: "ai-avatar",
    name: "AI Avatar Video",
    slug: "ai-avatar",
    description: "Create talking avatar videos powered by AI. Upload a face photo and text to generate realistic avatar videos.",
    category: "video",
    inputType: "image",
    outputType: "video",
    icon: "UserRound",
    models: ["kling-ai"],
    creditsCost: 12,
  },
};

export function getTool(slug: string): ToolConfig | undefined {
  return tools[slug];
}

export function getToolsByCategory(category: "video" | "image"): ToolConfig[] {
  return Object.values(tools).filter((t) => t.category === category);
}

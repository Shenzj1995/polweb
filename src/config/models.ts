export type GenerationType =
  | "TEXT_TO_VIDEO"
  | "IMAGE_TO_VIDEO"
  | "VIDEO_TO_VIDEO"
  | "TEXT_TO_IMAGE"
  | "IMAGE_TO_IMAGE"
  | "AVATAR_VIDEO";

export interface ModelConfig {
  id: string;
  name: string;
  provider: "piapi" | "replicate" | "fal";
  providerModelId: string;
  type: GenerationType[];
  category: "video" | "image";
  supportedParams: {
    duration: string[];
    resolution: string[];
    aspectRatio: string[];
    maxOutputCount: number;
  };
  creditsCost: Partial<Record<GenerationType, number>>;
  avgGenerationTime: number;
  isHot: boolean;
  isNew: boolean;
  slug: string;
  description: string;
}

export const models: Record<string, ModelConfig> = {
  "kling-ai": {
    id: "kling-ai",
    name: "Kling AI",
    provider: "piapi",
    providerModelId: "kling-v1.5",
    type: ["TEXT_TO_VIDEO", "IMAGE_TO_VIDEO"],
    category: "video",
    supportedParams: {
      duration: ["5", "10"],
      resolution: ["480p", "720p", "1080p"],
      aspectRatio: ["16:9", "9:16", "1:1"],
      maxOutputCount: 1,
    },
    creditsCost: { TEXT_TO_VIDEO: 10, IMAGE_TO_VIDEO: 10 },
    avgGenerationTime: 90,
    isHot: true,
    isNew: false,
    slug: "kling-ai",
    description: "Create cinematic AI videos from text or images with Kling AI by Kuaishou.",
  },
  "seedance-2": {
    id: "seedance-2",
    name: "Seedance 2.0",
    provider: "piapi",
    providerModelId: "seedance-v2",
    type: ["TEXT_TO_VIDEO", "IMAGE_TO_VIDEO"],
    category: "video",
    supportedParams: {
      duration: ["5", "10"],
      resolution: ["480p", "720p"],
      aspectRatio: ["16:9", "9:16", "1:1"],
      maxOutputCount: 1,
    },
    creditsCost: { TEXT_TO_VIDEO: 10, IMAGE_TO_VIDEO: 10 },
    avgGenerationTime: 120,
    isHot: true,
    isNew: true,
    slug: "seedance-2",
    description: "ByteDance's latest AI video generation model with stunning quality.",
  },
  "flux-schnell": {
    id: "flux-schnell",
    name: "FLUX Schnell",
    provider: "piapi",
    providerModelId: "flux-schnell",
    type: ["TEXT_TO_IMAGE"],
    category: "image",
    supportedParams: {
      duration: [],
      resolution: ["512x512", "768x768", "1024x1024"],
      aspectRatio: ["1:1", "16:9", "9:16", "3:2", "2:3"],
      maxOutputCount: 4,
    },
    creditsCost: { TEXT_TO_IMAGE: 1 },
    avgGenerationTime: 5,
    isHot: false,
    isNew: false,
    slug: "flux-schnell",
    description: "Lightning-fast AI image generation by Black Forest Labs.",
  },
  "flux-pro": {
    id: "flux-pro",
    name: "FLUX Pro",
    provider: "piapi",
    providerModelId: "flux-pro",
    type: ["TEXT_TO_IMAGE"],
    category: "image",
    supportedParams: {
      duration: [],
      resolution: ["1024x1024", "1024x768", "768x1024"],
      aspectRatio: ["1:1", "16:9", "9:16", "3:2", "2:3"],
      maxOutputCount: 4,
    },
    creditsCost: { TEXT_TO_IMAGE: 3 },
    avgGenerationTime: 10,
    isHot: true,
    isNew: false,
    slug: "flux-pro",
    description: "High-quality AI image generation with superior detail and accuracy.",
  },
  "runway-gen3": {
    id: "runway-gen3",
    name: "Runway Gen-3",
    provider: "piapi",
    providerModelId: "runway-gen3",
    type: ["TEXT_TO_VIDEO", "IMAGE_TO_VIDEO"],
    category: "video",
    supportedParams: {
      duration: ["5", "10"],
      resolution: ["720p", "1080p"],
      aspectRatio: ["16:9", "9:16"],
      maxOutputCount: 1,
    },
    creditsCost: { TEXT_TO_VIDEO: 10, IMAGE_TO_VIDEO: 10 },
    avgGenerationTime: 60,
    isHot: false,
    isNew: false,
    slug: "runway-gen3",
    description: "Professional-grade AI video generation by Runway ML.",
  },
  "luma-ai": {
    id: "luma-ai",
    name: "Luma Dream Machine",
    provider: "piapi",
    providerModelId: "luma-ai",
    type: ["TEXT_TO_VIDEO", "IMAGE_TO_VIDEO"],
    category: "video",
    supportedParams: {
      duration: ["5"],
      resolution: ["720p"],
      aspectRatio: ["16:9", "9:16", "1:1"],
      maxOutputCount: 1,
    },
    creditsCost: { TEXT_TO_VIDEO: 8, IMAGE_TO_VIDEO: 8 },
    avgGenerationTime: 45,
    isHot: false,
    isNew: false,
    slug: "luma-ai",
    description: "Fast and high-quality video generation with Luma AI Dream Machine.",
  },
  "stable-diffusion-3": {
    id: "stable-diffusion-3",
    name: "Stable Diffusion 3",
    provider: "piapi",
    providerModelId: "stable-diffusion-3",
    type: ["TEXT_TO_IMAGE", "IMAGE_TO_IMAGE"],
    category: "image",
    supportedParams: {
      duration: [],
      resolution: ["1024x1024"],
      aspectRatio: ["1:1", "16:9", "9:16"],
      maxOutputCount: 4,
    },
    creditsCost: { TEXT_TO_IMAGE: 1, IMAGE_TO_IMAGE: 1 },
    avgGenerationTime: 8,
    isHot: false,
    isNew: false,
    slug: "stable-diffusion-3",
    description: "The classic open-source AI image generation model by Stability AI.",
  },
};

export function getModel(slug: string): ModelConfig | undefined {
  return models[slug];
}

export function getModelsByCategory(category: "video" | "image"): ModelConfig[] {
  return Object.values(models).filter((m) => m.category === category);
}

export function getHotModels(): ModelConfig[] {
  return Object.values(models).filter((m) => m.isHot || m.isNew);
}

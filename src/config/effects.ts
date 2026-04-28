export interface EffectConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: "style" | "enhance" | "creative";
  thumbnail: string;
  models: string[];
  creditsCost: number;
}

export const effects: Record<string, EffectConfig> = {
  "anime-style": {
    id: "anime-style",
    name: "Anime Style",
    slug: "anime-style",
    description: "Transform your photos and videos into stunning anime-style artwork with vibrant colors and clean lines.",
    category: "style",
    thumbnail: "/effects/anime.jpg",
    models: ["flux-pro", "stable-diffusion-3"],
    creditsCost: 2,
  },
  "cinematic-look": {
    id: "cinematic-look",
    name: "Cinematic Look",
    slug: "cinematic-look",
    description: "Give your content a professional cinematic look with dramatic lighting and film-grade color grading.",
    category: "style",
    thumbnail: "/effects/cinematic.jpg",
    models: ["kling-ai", "runway-gen3"],
    creditsCost: 10,
  },
  "watercolor": {
    id: "watercolor",
    name: "Watercolor Painting",
    slug: "watercolor",
    description: "Convert images into beautiful watercolor paintings with soft edges and flowing colors.",
    category: "style",
    thumbnail: "/effects/watercolor.jpg",
    models: ["flux-pro", "stable-diffusion-3"],
    creditsCost: 2,
  },
  "upscale": {
    id: "upscale",
    name: "AI Upscale",
    slug: "upscale",
    description: "Enhance image and video resolution with AI-powered upscaling. Get crystal clear results up to 4x resolution.",
    category: "enhance",
    thumbnail: "/effects/upscale.jpg",
    models: ["flux-pro"],
    creditsCost: 2,
  },
  "background-remove": {
    id: "background-remove",
    name: "Background Removal",
    slug: "background-remove",
    description: "Instantly remove backgrounds from any image with AI. Get clean cutouts for any use case.",
    category: "enhance",
    thumbnail: "/effects/bg-remove.jpg",
    models: ["stable-diffusion-3"],
    creditsCost: 1,
  },
  "3d-effect": {
    id: "3d-effect",
    name: "3D Pop Effect",
    slug: "3d-effect",
    description: "Add a stunning 3D depth effect to your images, making elements pop out of the screen.",
    category: "creative",
    thumbnail: "/effects/3d.jpg",
    models: ["kling-ai"],
    creditsCost: 10,
  },
  "slow-motion": {
    id: "slow-motion",
    name: "Slow Motion",
    slug: "slow-motion",
    description: "Convert normal-speed videos into smooth slow-motion sequences with AI frame interpolation.",
    category: "creative",
    thumbnail: "/effects/slowmo.jpg",
    models: ["kling-ai", "runway-gen3"],
    creditsCost: 8,
  },
  "morph": {
    id: "morph",
    name: "Face Morph",
    slug: "morph",
    description: "Create smooth morphing transitions between faces or objects with AI-powered video transformation.",
    category: "creative",
    thumbnail: "/effects/morph.jpg",
    models: ["kling-ai"],
    creditsCost: 10,
  },
  "pixel-art": {
    id: "pixel-art",
    name: "Pixel Art",
    slug: "pixel-art",
    description: "Transform images into retro pixel art style with customizable pixel density and color palettes.",
    category: "style",
    thumbnail: "/effects/pixel.jpg",
    models: ["flux-schnell", "stable-diffusion-3"],
    creditsCost: 1,
  },
};

export function getEffect(slug: string): EffectConfig | undefined {
  return effects[slug];
}

export function getEffectsByCategory(category: "style" | "enhance" | "creative"): EffectConfig[] {
  return Object.values(effects).filter((e) => e.category === category);
}

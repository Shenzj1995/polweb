import { AIProvider, CreateGenParams, GenResult, GenStatusResult, WebhookResult } from "../types";
import { createServerFetch } from "@/lib/proxy-fetch";

const BASE_URL = "https://api.piapi.ai/api/v1";

function getApiKey(): string {
  const key = process.env.PIAPI_API_KEY;
  if (!key) throw new Error("PIAPI_API_KEY not configured");
  return key;
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  const res = await createServerFetch()(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    },
  });

  const json = await res.json() as { code?: number; message?: string; data?: unknown };
  if (json.code !== 200) {
    throw new Error(json.message || `PiAPI error: ${json.code}`);
  }
  return json.data;
}

// Map our model slug to PiAPI model + task_type + input mapper
const modelMapping: Record<string, {
  model: string;
  taskType: string;
  mapInput: (params: CreateGenParams) => Record<string, unknown>;
}> = {
  // Kling video
  "kling-v1.5": {
    model: "kling",
    taskType: "video_generation",
    mapInput: (p) => ({
      prompt: p.prompt || "",
      negative_prompt: p.negativePrompt || "",
      duration: Number(p.params.duration) || 5,
      aspect_ratio: (p.params.aspectRatio as string) || "16:9",
      mode: "std",
      ...(p.imageUrl ? { image: p.imageUrl } : {}),
    }),
  },
  // Runway video
  "runway-gen3": {
    model: "runway-gen3",
    taskType: "video_generation",
    mapInput: (p) => ({
      prompt: p.prompt || "",
      duration: Number(p.params.duration) || 5,
      ...(p.imageUrl ? { image: p.imageUrl } : {}),
    }),
  },
  // Luma video
  "luma-ai": {
    model: "luma-dream-machine",
    taskType: "video_generation",
    mapInput: (p) => ({
      prompt: p.prompt || "",
      aspect_ratio: (p.params.aspectRatio as string) || "16:9",
      ...(p.imageUrl ? { image_url: p.imageUrl } : {}),
    }),
  },
  // Flux Schnell image
  "flux-schnell": {
    model: "Qubico/flux1-schnell",
    taskType: "txt2img",
    mapInput: (p) => ({
      prompt: p.prompt || "",
      negative_prompt: p.negativePrompt || "",
      width: 1024,
      height: 1024,
      steps: 4,
    }),
  },
  // Flux Pro image
  "flux-pro": {
    model: "Qubico/flux1-dev",
    taskType: "txt2img",
    mapInput: (p) => ({
      prompt: p.prompt || "",
      negative_prompt: p.negativePrompt || "",
      width: 1024,
      height: 1024,
      steps: 20,
      guidance_scale: 3.5,
    }),
  },
  // Stable Diffusion image
  "stable-diffusion-3": {
    model: "stability/sdxl",
    taskType: "txt2img",
    mapInput: (p) => ({
      prompt: p.prompt || "",
      negative_prompt: p.negativePrompt || "",
      width: 1024,
      height: 1024,
      ...(p.imageUrl ? { image: p.imageUrl } : {}),
    }),
  },
};

interface PiAPITaskData {
  status: string;
  output?: {
    image_url?: string;
    video_url?: string;
    works?: Array<{
      video?: { resource?: string; resource_without_watermark?: string };
      video_url?: string;
      url?: string;
      cover?: { resource?: string; resource_without_watermark?: string };
    }>;
  };
  error?: { message?: string };
}

export class PiAPIProvider implements AIProvider {
  id = "piapi";
  name = "PiAPI";

  async createGeneration(params: CreateGenParams): Promise<GenResult> {
    const mapping = modelMapping[params.providerModelId];
    if (!mapping) {
      throw new Error(`Unknown PiAPI model: ${params.providerModelId}`);
    }

    const input = mapping.mapInput(params);

    const data = await apiFetch("/task", {
      method: "POST",
      body: JSON.stringify({
        model: mapping.model,
        task_type: mapping.taskType,
        input,
      }),
    }) as { task_id: string; status: string };

    return {
      providerId: data.task_id,
      status: data.status === "pending" ? "PENDING" : "PROCESSING",
    };
  }

  async getGenerationStatus(providerId: string): Promise<GenStatusResult> {
    const data = await apiFetch(`/task/${providerId}`) as PiAPITaskData;

    const statusMap: Record<string, GenStatusResult["status"]> = {
      pending: "PENDING",
      processing: "PROCESSING",
      completed: "SUCCEEDED",
      failed: "FAILED",
    };

    let outputUrl: string | undefined;
    let thumbnailUrl: string | undefined;
    if (data.output) {
      // Top-level image/video URL
      if (data.output.image_url) {
        outputUrl = data.output.image_url;
      } else if (data.output.video_url) {
        outputUrl = data.output.video_url;
      }
      // Video output via works array: works[0].video.resource (with or without watermark)
      if (data.output.works && Array.isArray(data.output.works) && data.output.works.length > 0) {
        const work = data.output.works[0];
        if (work.video && typeof work.video === "object") {
          outputUrl = outputUrl || work.video.resource_without_watermark || work.video.resource;
        }
        if (!outputUrl) outputUrl = work.video_url || work.url;
        // Extract cover/thumbnail
        if (work.cover && typeof work.cover === "object") {
          thumbnailUrl = work.cover.resource_without_watermark || work.cover.resource;
        }
      }
    }

    return {
      status: statusMap[data.status] || "PENDING",
      outputUrl,
      thumbnailUrl,
      error: data.error?.message || undefined,
    };
  }

  verifyWebhook(): boolean {
    return true;
  }

  async handleWebhook(payload: unknown): Promise<WebhookResult> {
    const data = payload as Record<string, unknown>;
    const output = data.output as Record<string, unknown> | undefined;

    let outputUrl: string | undefined;
    let thumbnailUrl: string | undefined;
    if (output) {
      if (output.image_url) outputUrl = output.image_url as string;
      if (output.video_url) outputUrl = output.video_url as string;
      if (output.works) {
        const works = output.works as Array<Record<string, unknown>>;
        if (works.length > 0) {
          const video = works[0].video as Record<string, string> | undefined;
          if (video && typeof video === "object") {
            outputUrl = outputUrl || video.resource_without_watermark || video.resource;
          }
          if (!outputUrl) outputUrl = (works[0].video_url as string) || (works[0].url as string);
          const cover = works[0].cover as Record<string, string> | undefined;
          if (cover && typeof cover === "object") {
            thumbnailUrl = cover.resource_without_watermark || cover.resource;
          }
        }
      }
    }

    return {
      providerId: data.task_id as string,
      status: data.status === "completed" ? "SUCCEEDED" : "FAILED",
      outputUrl,
      thumbnailUrl,
      error: (data.error as Record<string, string>)?.message || undefined,
    };
  }
}

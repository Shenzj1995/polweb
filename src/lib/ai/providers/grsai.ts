import { AIProvider, CreateGenParams, GenResult, GenStatusResult, WebhookResult } from "../types";
import { createServerFetch } from "@/lib/proxy-fetch";

const BASE_URL = "https://grsaiapi.com/v1/api";

function getApiKey(): string {
  const key = process.env.GRSAI_API_KEY;
  if (!key) throw new Error("GRSAI_API_KEY not configured");
  return key;
}

// Map our model slug to GRSAI model name
const modelMap: Record<string, string> = {
  "flux-schnell": "nano-banana-fast",
  "flux-pro": "nano-banana-pro",
  "stable-diffusion-3": "nano-banana-2",
};

const aspectRatioMap: Record<string, string> = {
  "1:1": "1:1",
  "16:9": "16:9",
  "9:16": "9:16",
  "3:2": "3:2",
  "2:3": "2:3",
  "4:3": "4:3",
  "3:4": "3:4",
};

export class GRSAIProvider implements AIProvider {
  id = "grsai";
  name = "GRSAI";

  async createGeneration(params: CreateGenParams): Promise<GenResult> {
    const model = modelMap[params.providerModelId];
    if (!model) throw new Error(`Unknown GRSAI model: ${params.providerModelId}`);

    const body: Record<string, unknown> = {
      model,
      prompt: params.prompt || "",
      images: params.imageUrl ? [params.imageUrl] : [],
      aspectRatio: aspectRatioMap[(params.params.aspectRatio as string) || "1:1"] || "1:1",
      imageSize: "1K",
      replyType: "async",
    };

    if (params.negativePrompt) {
      body.negativePrompt = params.negativePrompt;
    }

    const res = await createServerFetch()(`${BASE_URL}/generate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.id) {
      throw new Error(data.message || data.error || "GRSAI generate failed");
    }

    return {
      providerId: data.id,
      status: data.status === "succeeded" ? "PROCESSING" : "PENDING",
    };
  }

  async getGenerationStatus(providerId: string): Promise<GenStatusResult> {
    const res = await createServerFetch()(`${BASE_URL}/result`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: providerId }),
    });

    const data = await res.json();

    const statusMap: Record<string, GenStatusResult["status"]> = {
      pending: "PENDING",
      running: "PROCESSING",
      succeeded: "SUCCEEDED",
      failed: "FAILED",
    };

    let outputUrl: string | undefined;
    if (data.status === "succeeded" && data.results && Array.isArray(data.results) && data.results.length > 0) {
      outputUrl = data.results[0].url;
    }

    return {
      status: statusMap[data.status] || "PENDING",
      outputUrl,
      error: data.error || undefined,
    };
  }

  verifyWebhook(): boolean {
    return true;
  }

  async handleWebhook(payload: unknown): Promise<WebhookResult> {
    const data = payload as Record<string, unknown>;
    const results = data.results as Array<Record<string, string>> | undefined;

    return {
      providerId: data.id as string,
      status: data.status === "succeeded" ? "SUCCEEDED" : "FAILED",
      outputUrl: results?.[0]?.url || undefined,
    };
  }
}

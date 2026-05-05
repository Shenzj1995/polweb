import Replicate from "replicate";
import { createHmac, timingSafeEqual } from "node:crypto";
import { AIProvider, CreateGenParams, GenResult, GenStatusResult, WebhookResult } from "../types";
import { createServerFetch } from "@/lib/proxy-fetch";

export class ReplicateProvider implements AIProvider {
  id = "replicate";
  name = "Replicate";
  private client: Replicate;

  constructor() {
    this.client = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
      fetch: createServerFetch(),
    });
  }

  async createGeneration(params: CreateGenParams): Promise<GenResult> {
    const input: Record<string, unknown> = {};
    if (params.prompt) input.prompt = params.prompt;
    if (params.negativePrompt) input.negative_prompt = params.negativePrompt;
    if (params.imageUrl) input.image = params.imageUrl;
    if (params.params.duration) input.duration = params.params.duration;
    if (params.params.aspectRatio) input.aspect_ratio = params.params.aspectRatio;
    if (params.params.aspect_ratio) input.aspect_ratio = params.params.aspect_ratio;
    if (params.params.resolution) input.resolution = params.params.resolution;
    if (params.params.seed) input.seed = params.params.seed;

    const modelOrVersion = /^[a-f0-9]{64}$/i.test(params.providerModelId)
      ? { version: params.providerModelId }
      : { model: params.providerModelId };

    const prediction = await this.client.predictions.create({
      ...modelOrVersion,
      input,
      webhook: params.webhookUrl,
      webhook_events_filter: ["completed"],
    });

    return {
      providerId: prediction.id,
      status: prediction.status === "starting" ? "PENDING" : "PROCESSING",
    };
  }

  async getGenerationStatus(predictionId: string): Promise<GenStatusResult> {
    const prediction = await this.client.predictions.get(predictionId);
    const statusMap: Record<string, GenStatusResult["status"]> = {
      starting: "PENDING",
      processing: "PROCESSING",
      succeeded: "SUCCEEDED",
      failed: "FAILED",
      canceled: "FAILED",
    };

    let outputUrl: string | undefined;
    if (prediction.output) {
      outputUrl = Array.isArray(prediction.output)
        ? prediction.output[0] as string
        : prediction.output as string;
    }

    return {
      status: statusMap[prediction.status] || "PENDING",
      outputUrl,
      error: prediction.error as string | undefined,
    };
  }

  verifyWebhook(body: string, signature: string, headers?: Headers): boolean {
    if (!process.env.REPLICATE_WEBHOOK_SECRET) return true; // Skip if not configured

    const webhookId = headers?.get("webhook-id");
    const webhookTimestamp = headers?.get("webhook-timestamp");
    if (!webhookId || !webhookTimestamp || !signature) return false;

    const timestamp = Number(webhookTimestamp);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > 5 * 60) {
      return false;
    }

    const secret = process.env.REPLICATE_WEBHOOK_SECRET.replace(/^whsec_/, "");
    const expected = createHmac("sha256", Buffer.from(secret, "base64"))
      .update(`${webhookId}.${webhookTimestamp}.${body}`)
      .digest();

    for (const candidate of signature.split(" ")) {
      const [, value] = candidate.split(",");
      if (!value) continue;
      const received = Buffer.from(value, "base64");
      if (received.length === expected.length && timingSafeEqual(received, expected)) {
        return true;
      }
    }

    return false;
  }

  async handleWebhook(payload: Record<string, unknown>): Promise<WebhookResult> {
    return {
      providerId: payload.id as string,
      status: payload.status === "succeeded" ? "SUCCEEDED" : "FAILED",
      outputUrl: Array.isArray(payload.output)
        ? payload.output[0] as string
        : payload.output as string,
      error: payload.error as string | undefined,
    };
  }
}

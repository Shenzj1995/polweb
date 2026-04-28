import Replicate from "replicate";
import { AIProvider, CreateGenParams, GenResult, GenStatusResult, WebhookResult } from "../types";

export class ReplicateProvider implements AIProvider {
  id = "replicate";
  name = "Replicate";
  private client: Replicate;

  constructor() {
    this.client = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
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

    const prediction = await this.client.predictions.create({
      version: params.providerModelId,
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

  verifyWebhook(_body: string, _signature: string): boolean {
    // TODO: Implement Replicate webhook signature verification
    return true;
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

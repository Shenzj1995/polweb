import { AIProvider, CreateGenParams, GenResult, GenStatusResult, WebhookResult } from "../types";

export class FalProvider implements AIProvider {
  id = "fal";
  name = "fal.ai";

  async createGeneration(params: CreateGenParams): Promise<GenResult> {
    const { fal } = await import("@fal-ai/client");

    const input: Record<string, unknown> = {};
    if (params.prompt) input.prompt = params.prompt;
    if (params.negativePrompt) input.negative_prompt = params.negativePrompt;
    if (params.params.image_size) input.image_size = params.params.image_size;
    if (params.params.resolution) input.image_size = params.params.resolution;
    if (params.params.num_images) input.num_images = params.params.num_images;
    if (params.params.outputCount) input.num_images = params.params.outputCount;
    if (params.params.seed) input.seed = params.params.seed;

    const result = await fal.queue.submit(params.providerModelId, {
      input,
      webhookUrl: params.webhookUrl || undefined,
    });

    return {
      providerId: result.request_id,
      status: "PENDING",
    };
  }

  async getGenerationStatus(requestId: string, providerModelId?: string): Promise<GenStatusResult> {
    const { fal } = await import("@fal-ai/client");
    const modelId = providerModelId ?? "fal-ai/flux-pro";

    const status = await fal.queue.status(modelId, {
      requestId,
    });

    if (status.status === "COMPLETED") {
      const result = await fal.queue.result(modelId, { requestId });
      return {
        status: "SUCCEEDED",
        outputUrl: (result.data as Record<string, unknown>).images
          ? ((result.data as Record<string, unknown>).images as Array<{ url: string }>)[0]?.url
          : undefined,
      };
    }

    return {
      status: status.status === "IN_PROGRESS" ? "PROCESSING" : "PENDING",
    };
  }

  verifyWebhook(): boolean {
    return true;
  }

  async handleWebhook(payload: Record<string, unknown>): Promise<WebhookResult> {
    const images = payload.images as Array<{ url: string }> | undefined;
    return {
      providerId: payload.request_id as string,
      status: payload.status === "COMPLETED" ? "SUCCEEDED" : "FAILED",
      outputUrl: (payload.output_url as string | undefined) ?? images?.[0]?.url,
    };
  }
}

export interface AIProvider {
  id: string;
  name: string;

  createGeneration(params: CreateGenParams): Promise<GenResult>;
  getGenerationStatus(providerId: string, providerModelId?: string): Promise<GenStatusResult>;
  verifyWebhook(body: string, signature: string, headers?: Headers): boolean;
  handleWebhook(payload: unknown): Promise<WebhookResult>;
}

export interface CreateGenParams {
  type: string;
  model: string;
  providerModelId: string;
  prompt?: string;
  negativePrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  params: Record<string, unknown>;
  webhookUrl?: string;
}

export interface GenResult {
  providerId: string;
  status: "PENDING" | "PROCESSING";
  estimatedTime?: number;
}

export interface GenStatusResult {
  status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED";
  outputUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface WebhookResult {
  providerId: string;
  status: "SUCCEEDED" | "FAILED";
  outputUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

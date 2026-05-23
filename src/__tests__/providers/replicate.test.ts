import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReplicateProvider } from "@/lib/ai/providers/replicate";
import type { CreateGenParams } from "@/lib/ai/types";

// Type for testing - exposes private client property
type TestReplicateProvider = ReplicateProvider & {
  client: {
    predictions: {
      create: ReturnType<typeof vi.fn>;
      get: ReturnType<typeof vi.fn>;
    };
  };
};

// Mock the Replicate SDK
vi.mock("replicate", () => {
  return {
    default: class {
      predictions = {
        create: vi.fn(),
        get: vi.fn(),
      };
    },
  };
});

// Mock proxy-fetch
vi.mock("@/lib/proxy-fetch", () => ({
  createServerFetch: () => globalThis.fetch,
}));

describe("ReplicateProvider", () => {
  let provider: ReplicateProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new ReplicateProvider();
  });

  describe("createGeneration", () => {
    it("maps prompt to input correctly", async () => {
      const mockPrediction = { id: "pred-123", status: "starting" };
      (provider as TestReplicateProvider).client.predictions.create.mockResolvedValue(mockPrediction);

      const params: CreateGenParams = {
        type: "TEXT_TO_IMAGE",
        model: "flux-schnell",
        providerModelId: "black-forest-labs/flux-schnell",
        prompt: "A beautiful sunset",
        params: { aspectRatio: "16:9" },
      };

      const result = await provider.createGeneration(params);

      const call = (provider as TestReplicateProvider).client.predictions.create.mock.calls[0][0];
      expect(call.model).toBe("black-forest-labs/flux-schnell");
      expect(call.input.prompt).toBe("A beautiful sunset");
      expect(call.input.aspect_ratio).toBe("16:9");
      expect(result.providerId).toBe("pred-123");
      expect(result.status).toBe("PENDING");
    });

    it("uses version for 64-char hex providerModelId", async () => {
      const mockPrediction = { id: "pred-456", status: "processing" };
      (provider as TestReplicateProvider).client.predictions.create.mockResolvedValue(mockPrediction);

      const hash = "a".repeat(64);
      const params: CreateGenParams = {
        type: "TEXT_TO_VIDEO",
        model: "kling-ai",
        providerModelId: hash,
        prompt: "test",
        params: {},
      };

      await provider.createGeneration(params);

      const call = (provider as TestReplicateProvider).client.predictions.create.mock.calls[0][0];
      expect(call.version).toBe(hash);
      expect(call.model).toBeUndefined();
    });

    it("includes imageUrl as image in input", async () => {
      const mockPrediction = { id: "pred-789", status: "starting" };
      (provider as TestReplicateProvider).client.predictions.create.mockResolvedValue(mockPrediction);

      const params: CreateGenParams = {
        type: "IMAGE_TO_VIDEO",
        model: "kling-ai",
        providerModelId: "kuaishou/kling-v1.5",
        prompt: "animate this",
        imageUrl: "https://example.com/img.jpg",
        params: { duration: "5" },
      };

      await provider.createGeneration(params);

      const call = (provider as TestReplicateProvider).client.predictions.create.mock.calls[0][0];
      expect(call.input.image).toBe("https://example.com/img.jpg");
      expect(call.input.duration).toBe("5");
    });

    it("includes webhook only when webhookUrl is provided", async () => {
      const mockPrediction = { id: "pred-w", status: "starting" };
      (provider as TestReplicateProvider).client.predictions.create.mockResolvedValue(mockPrediction);

      const params: CreateGenParams = {
        type: "TEXT_TO_IMAGE",
        model: "flux-schnell",
        providerModelId: "black-forest-labs/flux-schnell",
        prompt: "test",
        params: {},
        webhookUrl: "https://example.com/webhook",
      };

      await provider.createGeneration(params);

      const call = (provider as TestReplicateProvider).client.predictions.create.mock.calls[0][0];
      expect(call.webhook).toBe("https://example.com/webhook");
      expect(call.webhook_events_filter).toEqual(["completed"]);
    });

    it("omits webhook when webhookUrl is undefined", async () => {
      const mockPrediction = { id: "pred-nw", status: "starting" };
      (provider as TestReplicateProvider).client.predictions.create.mockResolvedValue(mockPrediction);

      const params: CreateGenParams = {
        type: "TEXT_TO_IMAGE",
        model: "flux-schnell",
        providerModelId: "black-forest-labs/flux-schnell",
        prompt: "test",
        params: {},
      };

      await provider.createGeneration(params);

      const call = (provider as TestReplicateProvider).client.predictions.create.mock.calls[0][0];
      expect(call.webhook).toBeUndefined();
    });
  });

  describe("getGenerationStatus", () => {
    it("maps succeeded status and extracts output URL", async () => {
      (provider as TestReplicateProvider).client.predictions.get.mockResolvedValue({
        status: "succeeded",
        output: "https://output.url/image.png",
      });

      const result = await provider.getGenerationStatus("pred-123");
      expect(result.status).toBe("SUCCEEDED");
      expect(result.outputUrl).toBe("https://output.url/image.png");
    });

    it("extracts first URL from array output", async () => {
      (provider as TestReplicateProvider).client.predictions.get.mockResolvedValue({
        status: "succeeded",
        output: ["https://output.url/1.png", "https://output.url/2.png"],
      });

      const result = await provider.getGenerationStatus("pred-123");
      expect(result.outputUrl).toBe("https://output.url/1.png");
    });

    it("maps failed status with error", async () => {
      (provider as TestReplicateProvider).client.predictions.get.mockResolvedValue({
        status: "failed",
        error: "OOM",
      });

      const result = await provider.getGenerationStatus("pred-123");
      expect(result.status).toBe("FAILED");
      expect(result.error).toBe("OOM");
    });

    it("maps processing and starting correctly", async () => {
      (provider as TestReplicateProvider).client.predictions.get.mockResolvedValue({ status: "processing", output: null });
      const r1 = await provider.getGenerationStatus("pred-123");
      expect(r1.status).toBe("PROCESSING");

      (provider as TestReplicateProvider).client.predictions.get.mockResolvedValue({ status: "starting", output: null });
      const r2 = await provider.getGenerationStatus("pred-123");
      expect(r2.status).toBe("PENDING");
    });
  });

  describe("handleWebhook", () => {
    it("parses succeeded webhook payload", async () => {
      const result = await provider.handleWebhook({
        id: "pred-wh",
        status: "succeeded",
        output: "https://output.url/result.png",
      });

      expect(result.providerId).toBe("pred-wh");
      expect(result.status).toBe("SUCCEEDED");
      expect(result.outputUrl).toBe("https://output.url/result.png");
    });

    it("parses failed webhook payload", async () => {
      const result = await provider.handleWebhook({
        id: "pred-wh",
        status: "failed",
        error: "timeout",
      });

      expect(result.status).toBe("FAILED");
      expect(result.error).toBe("timeout");
    });

    it("handles array output in webhook", async () => {
      const result = await provider.handleWebhook({
        id: "pred-wh",
        status: "succeeded",
        output: ["https://output.url/1.png"],
      });

      expect(result.outputUrl).toBe("https://output.url/1.png");
    });
  });

  describe("verifyWebhook", () => {
    it("returns true when REPLICATE_WEBHOOK_SECRET is not set", () => {
      const original = process.env.REPLICATE_WEBHOOK_SECRET;
      delete process.env.REPLICATE_WEBHOOK_SECRET;
      expect(provider.verifyWebhook("body", "sig")).toBe(true);
      if (original) process.env.REPLICATE_WEBHOOK_SECRET = original;
    });
  });
});

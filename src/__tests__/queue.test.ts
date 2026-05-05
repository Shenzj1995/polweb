import { describe, it, expect, vi } from "vitest";

// Extract and test retry logic directly
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries && isRetryable(error)) {
        const delay = Math.pow(2, attempt) * 10; // Shortened for tests
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("timeout") || msg.includes("econnreset") || msg.includes("econnrefused") || msg.includes("network")) return true;
    if (msg.includes("429") || msg.includes("rate limit") || msg.includes("too many")) return true;
    if (msg.includes("500") || msg.includes("502") || msg.includes("503") || msg.includes("504")) return true;
  }
  return false;
}

describe("withRetry", () => {
  it("returns result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on retryable errors and succeeds", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValue("ok");

    const result = await withRetry(fn, 2);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries up to maxRetries then throws", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("502 Bad Gateway"));

    await expect(withRetry(fn, 2)).rejects.toThrow("502 Bad Gateway");
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it("does not retry non-retryable errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("INVALID_API_KEY"));

    await expect(withRetry(fn, 2)).rejects.toThrow("INVALID_API_KEY");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on rate limit (429)", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("429 rate limit exceeded"))
      .mockResolvedValue("ok");

    const result = await withRetry(fn, 1);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on network errors", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("ECONNRESET"))
      .mockResolvedValue("ok");

    const result = await withRetry(fn, 1);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("isRetryable", () => {
  it("detects timeout errors", () => {
    expect(isRetryable(new Error("Request timeout"))).toBe(true);
  });

  it("detects 5xx errors", () => {
    expect(isRetryable(new Error("500 Internal Server Error"))).toBe(true);
    expect(isRetryable(new Error("502 Bad Gateway"))).toBe(true);
    expect(isRetryable(new Error("503 Service Unavailable"))).toBe(true);
  });

  it("detects rate limit errors", () => {
    expect(isRetryable(new Error("429 Too Many Requests"))).toBe(true);
  });

  it("does not retry business logic errors", () => {
    expect(isRetryable(new Error("INVALID_API_KEY"))).toBe(false);
    expect(isRetryable(new Error("MODEL_NOT_FOUND"))).toBe(false);
    expect(isRetryable(new Error("INSUFFICIENT_CREDITS"))).toBe(false);
  });

  it("does not retry non-Error objects", () => {
    expect(isRetryable("string error")).toBe(false);
    expect(isRetryable(null)).toBe(false);
  });
});

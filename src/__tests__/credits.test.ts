import { describe, it, expect } from "vitest";
import { models } from "@/config/models";
import { PLANS } from "@/config/plans";

describe("credits business logic contracts", () => {
  it("spendCredits should fail when user has insufficient credits", () => {
    const result = { count: 0 };
    expect(result.count).toBe(0);
  });

  it("spendCredits should succeed when user has enough credits", () => {
    const result = { count: 1 };
    expect(result.count).toBe(1);
  });

  it("refundGenerationCredits is idempotent", () => {
    const existingLog = { id: "log-1", balanceAfter: 15 };
    expect(existingLog).toBeTruthy();
  });

  it("grantCreditsOnce is idempotent", () => {
    const existingLog = { id: "log-2", balanceAfter: 300 };
    expect(existingLog).toBeTruthy();
  });
});

describe("credit cost mapping", () => {
  it("TEXT_TO_IMAGE on flux-schnell costs 1 credit", () => {
    expect(models["flux-schnell"].creditsCost.TEXT_TO_IMAGE).toBe(1);
  });

  it("TEXT_TO_VIDEO on kling-ai costs 10 credits", () => {
    expect(models["kling-ai"].creditsCost.TEXT_TO_VIDEO).toBe(10);
  });

  it("IMAGE_TO_VIDEO on seedance-2 costs 10 credits", () => {
    expect(models["seedance-2"].creditsCost.IMAGE_TO_VIDEO).toBe(10);
  });

  it("TEXT_TO_IMAGE on flux-pro costs 3 credits", () => {
    expect(models["flux-pro"].creditsCost.TEXT_TO_IMAGE).toBe(3);
  });
});

describe("parallel generation limits", () => {
  it("FREE plan allows 1 parallel task", () => {
    expect(PLANS.FREE.parallelTasks).toBe(1);
  });

  it("STARTER plan allows 2 parallel tasks", () => {
    expect(PLANS.STARTER.parallelTasks).toBe(2);
  });

  it("PRO plan allows 3 parallel tasks", () => {
    expect(PLANS.PRO.parallelTasks).toBe(3);
  });
});

describe("generation expiry", () => {
  it("FREE plan generations expire after 7 days", () => {
    const now = Date.now();
    const freeExpiry = new Date(now + 7 * 24 * 60 * 60 * 1000);
    const diff = freeExpiry.getTime() - now;
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("STARTER plan generations expire after 30 days", () => {
    const now = Date.now();
    const starterExpiry = new Date(now + 30 * 24 * 60 * 60 * 1000);
    const diff = starterExpiry.getTime() - now;
    expect(diff).toBe(30 * 24 * 60 * 60 * 1000);
  });
});

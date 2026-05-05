import { describe, it, expect } from "vitest";
import { models, getModel, getModelsByCategory, getHotModels } from "@/config/models";
import { tools, getTool, getToolsByCategory } from "@/config/tools";
import { effects, getEffect, getEffectsByCategory } from "@/config/effects";
import { PLANS, getPriceId } from "@/config/plans";

describe("models config", () => {
  it("has all expected models", () => {
    const keys = Object.keys(models);
    expect(keys).toContain("kling-ai");
    expect(keys).toContain("seedance-2");
    expect(keys).toContain("flux-schnell");
    expect(keys).toContain("flux-pro");
    expect(keys).toContain("runway-gen3");
    expect(keys).toContain("luma-ai");
    expect(keys).toContain("stable-diffusion-3");
  });

  it("getModel returns correct model", () => {
    const flux = getModel("flux-schnell");
    expect(flux).toBeDefined();
    expect(flux!.name).toBe("FLUX Schnell");
    expect(flux!.category).toBe("image");
  });

  it("getModel returns undefined for unknown slug", () => {
    expect(getModel("nonexistent")).toBeUndefined();
  });

  it("getModelsByCategory filters correctly", () => {
    const video = getModelsByCategory("video");
    const image = getModelsByCategory("image");
    expect(video.every((m) => m.category === "video")).toBe(true);
    expect(image.every((m) => m.category === "image")).toBe(true);
  });

  it("getHotModels returns only hot or new models", () => {
    const hot = getHotModels();
    expect(hot.length).toBeGreaterThan(0);
    expect(hot.every((m) => m.isHot || m.isNew)).toBe(true);
  });

  it("every model has required fields", () => {
    for (const model of Object.values(models)) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.provider).toBeTruthy();
      expect(model.providerModelId).toBeTruthy();
      expect(model.slug).toBeTruthy();
      expect(model.description).toBeTruthy();
      expect(model.type.length).toBeGreaterThan(0);
      expect(Object.keys(model.creditsCost).length).toBeGreaterThan(0);
    }
  });
});

describe("tools config", () => {
  it("has all expected tools", () => {
    const keys = Object.keys(tools);
    expect(keys).toContain("text-to-video");
    expect(keys).toContain("image-to-video");
    expect(keys).toContain("text-to-image");
    expect(keys).toContain("image-to-image");
    expect(keys).toContain("video-to-video");
    expect(keys).toContain("ai-avatar");
  });

  it("getTool returns correct tool", () => {
    const t2v = getTool("text-to-video");
    expect(t2v).toBeDefined();
    expect(t2v!.category).toBe("video");
    expect(t2v!.inputType).toBe("text");
    expect(t2v!.outputType).toBe("video");
  });

  it("getToolsByCategory filters correctly", () => {
    const video = getToolsByCategory("video");
    const image = getToolsByCategory("image");
    expect(video.length).toBeGreaterThan(0);
    expect(image.length).toBeGreaterThan(0);
  });
});

describe("effects config", () => {
  it("has effects in each category", () => {
    const style = getEffectsByCategory("style");
    const enhance = getEffectsByCategory("enhance");
    const creative = getEffectsByCategory("creative");
    expect(style.length).toBeGreaterThan(0);
    expect(enhance.length).toBeGreaterThan(0);
    expect(creative.length).toBeGreaterThan(0);
  });

  it("getEffect returns correct effect", () => {
    const anime = getEffect("anime-style");
    expect(anime).toBeDefined();
    expect(anime!.category).toBe("style");
  });
});

describe("plans config", () => {
  it("has FREE, STARTER, PRO plans", () => {
    expect(PLANS.FREE).toBeDefined();
    expect(PLANS.STARTER).toBeDefined();
    expect(PLANS.PRO).toBeDefined();
  });

  it("plans have increasing prices and credits", () => {
    expect(PLANS.FREE.price).toBeLessThan(PLANS.STARTER.price);
    expect(PLANS.STARTER.price).toBeLessThan(PLANS.PRO.price);
    expect(PLANS.FREE.credits).toBeLessThan(PLANS.STARTER.credits);
    expect(PLANS.STARTER.credits).toBeLessThan(PLANS.PRO.credits);
  });

  it("getPriceId returns null without env vars", () => {
    expect(getPriceId("STARTER", false)).toBeNull();
    expect(getPriceId("PRO", true)).toBeNull();
  });

  it("getPriceId returns null for FREE plan", () => {
    expect(getPriceId("FREE" as "STARTER", false)).toBeNull();
  });
});

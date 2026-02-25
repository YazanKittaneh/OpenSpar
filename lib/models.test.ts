import { describe, expect, it } from "vitest";

import {
  getCuratedModels,
  mergeModelCatalogs,
  normalizeOpenRouterCatalog,
  normalizeOpenRouterModel,
} from "./models";

describe("normalizeOpenRouterModel", () => {
  it("maps supported_parameters to reasoning capabilities", () => {
    const model = normalizeOpenRouterModel({
      id: "openai/gpt-5.3-codex",
      name: "OpenAI: GPT-5.3-Codex",
      supported_parameters: ["max_tokens", "reasoning", "include_reasoning"],
      context_length: 400000,
      pricing: { prompt: "0.00000175", completion: "0.000014" },
    });

    expect(model).toMatchObject({
      id: "openai/gpt-5.3-codex",
      provider: "OpenAI",
      source: "openrouter",
      reasoningCapable: true,
      reasoningToggleable: true,
      contextLength: 400000,
    });
    expect(model?.supportedParameters).toContain("reasoning");
    expect(model?.pricing).toEqual({
      prompt: 0.00000175,
      completion: 0.000014,
    });
  });

  it("drops malformed rows", () => {
    expect(normalizeOpenRouterModel({})).toBeNull();
    expect(normalizeOpenRouterModel({ id: 123 })).toBeNull();
  });

  it("can infer reasoning capability from model naming heuristics", () => {
    const model = normalizeOpenRouterModel({
      id: "openai/o3-mini",
      name: "OpenAI: o3-mini",
      supported_parameters: ["max_tokens"],
    });

    expect(model?.reasoningCapable).toBe(true);
    expect(model?.reasoningToggleable).toBe(false);
  });
});

describe("mergeModelCatalogs", () => {
  it("keeps curated display metadata when ids overlap", () => {
    const curated = getCuratedModels();
    const fetched = [
      {
        id: "openai/gpt-4",
        name: "OpenAI: GPT-4 (fetched)",
        provider: "OpenAI",
        source: "openrouter" as const,
        reasoningCapable: true,
        reasoningToggleable: true,
        contextLength: 128000,
        pricing: { prompt: 0.0000025, completion: 0.00001 },
      },
      {
        id: "openai/gpt-5.3-codex",
        name: "OpenAI: GPT-5.3-Codex",
        provider: "OpenAI",
        source: "openrouter" as const,
        reasoningCapable: true,
        reasoningToggleable: true,
      },
    ];

    const merged = mergeModelCatalogs(curated, fetched);
    const gpt4 = merged.find((model) => model.id === "openai/gpt-4");
    const codex = merged.find((model) => model.id === "openai/gpt-5.3-codex");

    expect(gpt4?.name).toBe("GPT-4");
    expect(gpt4?.source).toBe("curated");
    expect(gpt4?.contextLength).toBe(128000);
    expect(gpt4?.pricing).toEqual({ prompt: 0.0000025, completion: 0.00001 });
    expect(codex?.source).toBe("openrouter");
  });
});

describe("normalizeOpenRouterCatalog", () => {
  it("skips malformed rows in payload data", () => {
    const models = normalizeOpenRouterCatalog({
      data: [
        { id: "openai/gpt-4o-mini", name: "OpenAI: GPT-4o Mini", supported_parameters: [] },
        { id: "" },
        42,
        { name: "missing id" },
      ],
    });

    expect(models).toHaveLength(1);
    expect(models[0]?.id).toBe("openai/gpt-4o-mini");
  });
});

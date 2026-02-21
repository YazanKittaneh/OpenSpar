import { afterEach, describe, expect, it } from "vitest";

import { getConvexEnv, getOpenRouterEnv } from "./env";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("env accessors", () => {
  it("gets convex env without requiring openrouter key", () => {
    process.env.CONVEX_DEPLOYMENT_URL = "https://example.convex.cloud";
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
    delete process.env.OPENROUTER_API_KEY;

    const env = getConvexEnv();
    expect(env.CONVEX_DEPLOYMENT_URL).toContain("convex.cloud");
  });

  it("requires openrouter key only for openrouter accessor", () => {
    delete process.env.OPENROUTER_API_KEY;
    expect(() => getOpenRouterEnv()).toThrowError(
      "Missing required environment variable: OPENROUTER_API_KEY",
    );
  });
});

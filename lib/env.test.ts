import { afterEach, describe, expect, it } from "vitest";

import { getConvexEnv } from "./env";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("env accessors", () => {
  it("gets convex env", () => {
    process.env.CONVEX_DEPLOYMENT_URL = "https://example.convex.cloud";

    const env = getConvexEnv();
    expect(env.CONVEX_DEPLOYMENT_URL).toContain("convex.cloud");
  });

  it("throws when convex url env is missing", () => {
    delete process.env.CONVEX_DEPLOYMENT_URL;
    expect(() => getConvexEnv()).toThrowError(
      "Missing required environment variable: CONVEX_DEPLOYMENT_URL",
    );
  });
});

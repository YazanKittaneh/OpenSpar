import { describe, expect, it } from "vitest";

import { isConvexIdError } from "./errors";

describe("isConvexIdError", () => {
  it("detects known convex id validation patterns", () => {
    expect(isConvexIdError(new Error("Invalid argument `id`"))).toBe(true);
    expect(isConvexIdError(new Error("ArgumentValidationError: invalid id"))).toBe(true);
    expect(isConvexIdError(new Error("Network timeout"))).toBe(false);
  });
});

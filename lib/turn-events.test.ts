import { describe, expect, it } from "vitest";

import { normalizeCompletedTurn } from "./turn-events";

describe("normalizeCompletedTurn", () => {
  it("uses explicit turn metadata from the event payload", () => {
    const result = normalizeCompletedTurn(
      {
        speaker: "A",
        fullContent: "Visible content",
        reasoning: "Internal reasoning",
        turnNumber: 7,
        timestamp: 1_700_000_000_000,
      },
      99,
      1_600_000_000_000,
    );

    expect(result).toEqual({
      number: 7,
      speaker: "A",
      content: "Visible content",
      reasoning: "Internal reasoning",
      timestamp: new Date(1_700_000_000_000),
    });
  });

  it("falls back to supplied defaults for legacy payloads", () => {
    const result = normalizeCompletedTurn(
      {
        speaker: "B",
        fullContent: "Legacy payload",
      },
      3,
      1_650_000_000_000,
    );

    expect(result).toEqual({
      number: 3,
      speaker: "B",
      content: "Legacy payload",
      reasoning: undefined,
      timestamp: new Date(1_650_000_000_000),
    });
  });

  it("normalizes blank reasoning to undefined", () => {
    const result = normalizeCompletedTurn(
      {
        speaker: "A",
        fullContent: "Answer",
        reasoning: "   ",
      },
      2,
      1_650_000_000_000,
    );

    expect(result?.reasoning).toBeUndefined();
  });

  it("returns null when speaker is missing", () => {
    const result = normalizeCompletedTurn(
      {
        fullContent: "No speaker",
      },
      1,
      1_650_000_000_000,
    );

    expect(result).toBeNull();
  });
});

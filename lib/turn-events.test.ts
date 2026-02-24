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

  it("strips reasoning markup from visible content", () => {
    const result = normalizeCompletedTurn(
      {
        speaker: "A",
        fullContent:
          "Public intro <reasoning>private notes</reasoning> public outro",
      },
      4,
      1_650_000_000_000,
    );

    expect(result?.content).toBe("Public intro  public outro");
    expect(result?.reasoning).toBe("private notes");
  });

  it("extracts rationale summary markup when present", () => {
    const result = normalizeCompletedTurn(
      {
        speaker: "A",
        fullContent:
          "Public intro <rationale_summary>high level summary</rationale_summary> public outro",
      },
      6,
      1_650_000_000_000,
    );

    expect(result?.content).toBe("Public intro  public outro");
    expect(result?.reasoning).toBe("high level summary");
  });

  it("prefers explicit reasoning over extracted markup reasoning", () => {
    const result = normalizeCompletedTurn(
      {
        speaker: "A",
        fullContent: "<reasoning>tag reasoning</reasoning> visible",
        reasoning: "payload reasoning",
      },
      5,
      1_650_000_000_000,
    );

    expect(result?.reasoning).toBe("payload reasoning");
    expect(result?.content).toBe(" visible");
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

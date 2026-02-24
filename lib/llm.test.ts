import { describe, expect, it } from "vitest";

import { parseReasoningChunk } from "./llm";

function collectParsed(chunks: string[]) {
  const state = { activeTag: null as "reasoning" | "rationale_summary" | null, remainder: "" };
  let visible = "";
  let hiddenReasoning = "";
  let hiddenRationaleSummary = "";

  for (const chunk of chunks) {
    const parsed = parseReasoningChunk(chunk, state);
    visible += parsed.visible;
    hiddenReasoning += parsed.hiddenReasoning;
    hiddenRationaleSummary += parsed.hiddenRationaleSummary;
  }

  return { visible, hiddenReasoning, hiddenRationaleSummary, state };
}

describe("parseReasoningChunk", () => {
  it("does not leak split opening reasoning tags into visible output", () => {
    const { visible, hiddenReasoning } = collectParsed([
      "Hello <reason",
      "ing>Secret plan</reasoning> world",
    ]);

    expect(visible).toBe("Hello  world");
    expect(hiddenReasoning).toBe("Secret plan");
  });

  it("handles split closing reasoning tags correctly", () => {
    const { visible, hiddenReasoning } = collectParsed([
      "<reasoning>Need to emphasize",
      " adaptation</reas",
      "oning>Done.",
    ]);

    expect(visible).toBe("Done.");
    expect(hiddenReasoning).toBe("Need to emphasize adaptation");
  });

  it("captures multiple reasoning blocks in a stream", () => {
    const { visible, hiddenReasoning } = collectParsed([
      "A<reasoning>R1</reasoning>B<reasoning>R2</reasoning>C",
    ]);

    expect(visible).toBe("ABC");
    expect(hiddenReasoning).toBe("R1R2");
  });

  it("captures rationale summary blocks and keeps them out of visible text", () => {
    const { visible, hiddenRationaleSummary, hiddenReasoning } = collectParsed([
      "Argument body.<rationale_summary>High level why</rationale_summary>",
    ]);

    expect(visible).toBe("Argument body.");
    expect(hiddenRationaleSummary).toBe("High level why");
    expect(hiddenReasoning).toBe("");
  });

  it("handles split rationale summary tags across chunks", () => {
    const { visible, hiddenRationaleSummary } = collectParsed([
      "A<rationale_sum",
      "mary>because X</rationale_",
      "summary>B",
    ]);

    expect(visible).toBe("AB");
    expect(hiddenRationaleSummary).toBe("because X");
  });
});

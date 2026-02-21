import { describe, expect, it } from "vitest";

import {
  calculateSimilarity,
  checkForAgreement,
  checkForCircularArgument,
} from "./debate-intelligence";
import { Turn } from "./types";

describe("debate intelligence", () => {
  it("detects agreement phrases", () => {
    expect(checkForAgreement("I agree with your final point.")).toBe(true);
    expect(checkForAgreement("I strongly disagree.")).toBe(false);
  });

  it("computes similarity in range [0,1]", () => {
    const score = calculateSimilarity("alpha beta", "alpha gamma");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("detects circular arguments when last 3 turns per speaker repeat", () => {
    const turns: Turn[] = [
      { number: 1, speaker: "A", content: "Both methods are effectively equivalent in this context.", timestamp: new Date() },
      { number: 2, speaker: "B", content: "Both methods are effectively equivalent in this context.", timestamp: new Date() },
      { number: 3, speaker: "A", content: "Both methods are effectively equivalent in this context.", timestamp: new Date() },
      { number: 4, speaker: "B", content: "Both methods are effectively equivalent in this context.", timestamp: new Date() },
      { number: 5, speaker: "A", content: "Both methods are effectively equivalent in this context.", timestamp: new Date() },
      { number: 6, speaker: "B", content: "Both methods are effectively equivalent in this context.", timestamp: new Date() },
    ];

    expect(checkForCircularArgument(turns)).toBe(true);
  });
});

import { Turn } from "@/lib/types";

const AGREEMENT_PHRASES = [
  "i agree",
  "i concede",
  "you're right",
  "you are right",
  "fair point",
  "i accept",
  "convincing argument",
  "i cannot disagree",
];

export function checkForAgreement(content: string): boolean {
  const lower = content.toLowerCase();
  return AGREEMENT_PHRASES.some((phrase) => lower.includes(phrase));
}

export function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(Boolean));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(Boolean));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

function averagePairSimilarity(contents: string[]): number {
  let total = 0;
  let pairs = 0;

  for (let i = 0; i < contents.length; i += 1) {
    for (let j = i + 1; j < contents.length; j += 1) {
      total += calculateSimilarity(contents[i], contents[j]);
      pairs += 1;
    }
  }

  return pairs === 0 ? 0 : total / pairs;
}

export function checkForCircularArgument(turns: Turn[]): boolean {
  if (turns.length < 6) return false;

  const recentA = turns.filter((t) => t.speaker === "A").slice(-3);
  const recentB = turns.filter((t) => t.speaker === "B").slice(-3);

  if (recentA.length < 3 || recentB.length < 3) return false;

  const contents = [...recentA, ...recentB].map((t) => t.content);
  return averagePairSimilarity(contents) >= 0.75;
}

export function agreementConfidence(content: string): number {
  return checkForAgreement(content) ? 0.9 : 0;
}

export function circularConfidence(turns: Turn[]): number {
  if (!checkForCircularArgument(turns)) return 0;

  const contents = turns.slice(-6).map((turn) => turn.content);
  return averagePairSimilarity(contents);
}

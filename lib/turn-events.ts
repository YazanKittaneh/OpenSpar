import { Speaker, Turn } from "./types";

export interface TurnCompletedPayload {
  speaker?: Speaker;
  fullContent?: string;
  reasoning?: string;
  turnNumber?: number;
  timestamp?: number;
}

function normalizeReasoning(reasoning?: string): string | undefined {
  if (typeof reasoning !== "string") return undefined;
  const trimmed = reasoning.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function extractReasoningFromContent(content?: string): string | undefined {
  if (typeof content !== "string") return undefined;

  const rationaleMatches = [
    ...content.matchAll(/<rationale_summary>([\s\S]*?)<\/rationale_summary>/g),
  ];
  const reasoningMatches = [...content.matchAll(/<reasoning>([\s\S]*?)<\/reasoning>/g)];

  const matches = rationaleMatches.length > 0 ? rationaleMatches : reasoningMatches;
  if (matches.length === 0) return undefined;

  const combined = matches
    .map((match) => (match[1] ?? "").trim())
    .filter((text) => text.length > 0)
    .join("\n\n");

  return combined.length > 0 ? combined : undefined;
}

function sanitizeVisibleContent(content?: string): string {
  if (typeof content !== "string") return "";

  return content
    .replace(/<rationale_summary>[\s\S]*?<\/rationale_summary>/g, "")
    .replace(/<rationale_summary>[\s\S]*$/g, "")
    .replace(/<\/rationale_summary>/g, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/g, "")
    .replace(/<reasoning>[\s\S]*$/g, "")
    .replace(/<\/reasoning>/g, "");
}

export function normalizeCompletedTurn(
  payload: TurnCompletedPayload,
  fallbackNumber: number,
  fallbackTimestampMs = Date.now(),
): Turn | null {
  if (!payload.speaker) return null;

  const resolvedTurnNumber =
    typeof payload.turnNumber === "number" &&
    Number.isInteger(payload.turnNumber) &&
    payload.turnNumber > 0
      ? payload.turnNumber
      : fallbackNumber;

  const resolvedTimestamp =
    typeof payload.timestamp === "number" &&
    Number.isFinite(payload.timestamp) &&
    payload.timestamp > 0
      ? payload.timestamp
      : fallbackTimestampMs;

  const extractedReasoning = extractReasoningFromContent(payload.fullContent);

  return {
    number: resolvedTurnNumber,
    speaker: payload.speaker,
    content: sanitizeVisibleContent(payload.fullContent),
    reasoning: normalizeReasoning(payload.reasoning) ?? extractedReasoning,
    timestamp: new Date(resolvedTimestamp),
  };
}

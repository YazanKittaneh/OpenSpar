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

  return {
    number: resolvedTurnNumber,
    speaker: payload.speaker,
    content: payload.fullContent ?? "",
    reasoning: normalizeReasoning(payload.reasoning),
    timestamp: new Date(resolvedTimestamp),
  };
}

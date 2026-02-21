export type DebateStatus =
  | "created"
  | "running"
  | "paused"
  | "completed"
  | "aborted";

export type WinningCondition = "self-terminate" | "user-decides" | "ai-judge";

export type Speaker = "A" | "B";

export interface DebaterConfig {
  model: string;
  name: string;
  systemPrompt?: string;
  objective?: string;
}

export interface Turn {
  number: number;
  speaker: Speaker;
  content: string;
  reasoning?: string;
  timestamp: Date;
}

export interface Debate {
  id: string;
  topic: string;
  format: "turn-based";
  maxTurns: number;
  winningCondition: WinningCondition;
  debaterA: DebaterConfig;
  debaterB: DebaterConfig;
  turns: Turn[];
  status: DebateStatus;
  winner?: Speaker | "draw" | null;
  currentSpeaker: Speaker;
  createdAt: Date;
  updatedAt: Date;
}

export type UserActionType = "pause" | "resume" | "skip" | "inject";

export interface UserAction {
  type: UserActionType;
  payload?: string;
}

export type SSEEvent =
  | { type: "debate.started"; debate: Debate }
  | { type: "turn.started"; speaker: Speaker; turnNumber: number }
  | { type: "token"; speaker: Speaker; content: string }
  | { type: "turn.completed"; speaker: Speaker; fullContent: string }
  | {
      type: "debate.completed";
      winner: Speaker | "draw" | null;
      reason: string;
    }
  | { type: "action.processed"; action: UserAction }
  | { type: "error"; message: string };

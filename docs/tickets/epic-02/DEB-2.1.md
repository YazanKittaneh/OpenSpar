---
id: DEB-2.1
title: Define Core Debate Types
ePic: Type System & Core Types
priority: P0
status: TODO
points: 3
assignee: TBD
labels: [types, typescript, core]
---

## Description
Create comprehensive TypeScript types for debates, turns, speakers, and events.

## Acceptance Criteria
- [ ] Create `DebateStatus` type: `'created' | 'running' | 'paused' | 'completed' | 'aborted'`
- [ ] Create `WinningCondition` type: `'self-terminate' | 'user-decides' | 'ai-judge'`
- [ ] Create `Speaker` type: `'A' | 'B'`
- [ ] Create `DebaterConfig` interface with model, name, systemPrompt, objective
- [ ] Create `Turn` interface with number, speaker, content, reasoning, timestamp
- [ ] Create `Debate` interface with all required fields
- [ ] Create `UserAction` and `UserActionType` types
- [ ] Create `SSEEvent` union type for all event types

## Files Created
- `lib/types.ts`

## Definition of Done
- [ ] All types compile with `npx tsc --noEmit`
- [ ] Types are comprehensive and type-safe

## Code Template
```typescript
// lib/types.ts

export type DebateStatus = 'created' | 'running' | 'paused' | 'completed' | 'aborted';
export type WinningCondition = 'self-terminate' | 'user-decides' | 'ai-judge';
export type Speaker = 'A' | 'B';

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
  format: 'turn-based';
  maxTurns: number;
  winningCondition: WinningCondition;
  debaterA: DebaterConfig;
  debaterB: DebaterConfig;
  turns: Turn[];
  status: DebateStatus;
  winner?: Speaker | 'draw' | null;
  currentSpeaker: Speaker;
  createdAt: Date;
  updatedAt: Date;
}

export type UserActionType = 'pause' | 'resume' | 'skip' | 'inject';

export interface UserAction {
  type: UserActionType;
  payload?: string;
}

export type SSEEvent = 
  | { type: 'debate.started'; debate: Debate }
  | { type: 'turn.started'; speaker: Speaker; turnNumber: number }
  | { type: 'token'; speaker: Speaker; content: string }
  | { type: 'turn.completed'; speaker: Speaker; fullContent: string }
  | { type: 'debate.completed'; winner: Speaker | 'draw' | null; reason: string }
  | { type: 'action.processed'; action: UserAction }
  | { type: 'error'; message: string };
```

## Dependencies
None

## Blocks
2.2, 3.1, 3.2, 4.1, 5.1, 6.1, 7.2, 8.2

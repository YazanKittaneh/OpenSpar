# LLM Debate Arena - Design Document

**Date:** 2025-02-15  
**Status:** Approved  
**Approach:** Server-Sent Events (SSE) with Async Queue

---

## Overview

A web application that allows users to pit two LLMs against each other in structured debates. LLMs take turns arguing their positions while only seeing each other's public responses (reasoning is filtered). Users can watch in real-time, control the flow, and determine winners through various conditions.

---

## User Requirements Summary

From brainstorming session:
- **Debate format:** Turn-based chat with multiple format options (user configurable)
- **Reasoning visibility:** Filtered - LLMs see only final responses, not reasoning steps
- **Winning conditions:** Configurable (self-terminate, user decides, AI judge, etc.)
- **Debate scenarios:** Open-ended topics, structured objectives, role-playing, custom per-debater objectives
- **User interaction:** Observer, moderator, and participant modes (toggleable)
- **LLM providers:** Flexible - support multiple providers (OpenRouter, Anthropic, OpenAI, local models)
- **MVP scope:** Core experience - one provider, one format, clean UI, no persistence

---

## Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Setup Page │  │ Debate View │  │  Results/History    │  │
│  │ (Configure) │  │ (Watch SSE) │  │  (Post-debate)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (App Router)                    │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ POST /debates   │  │ GET /debates │  │ POST /turn     │  │
│  │ (create debate) │  │ /[id]/stream │  │ (user action)  │  │
│  └─────────────────┘  │   (SSE)      │  └────────────────┘  │
│                       └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Debate Engine (Server)                      │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │ Turn Manager     │  │ LLM Client     │  │ State Store │  │
│  │ (orchestrates)   │  │ (OpenRouter)   │  │ (in-memory  │  │
│  └──────────────────┘  │ with streaming │  │  for MVP)   │  │
│                        └────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Decisions

1. **State Management:** In-memory Map for MVP (simple, fast). Can upgrade to Redis later for persistence/multi-server.

2. **Debate Flow:**
   - User configures debate (2 models, topic, format, max turns)
   - Server creates debate with unique ID
   - Client connects to SSE endpoint for that debate
   - Server runs turns: Model A → Model B → Model A → ... until complete
   - Each response streams to client in real-time
   - User can POST actions (pause, skip, inject comment)

3. **LLM Integration:** OpenRouter API with streaming enabled. Each model gets system prompt based on debate context.

---

## Components & UI

### Page Structure

**Route: `/` - Setup Page**
```
┌─────────────────────────────────────────────────────────┐
│  🥊 LLM Debate Arena                                    │
├─────────────────────────────────────────────────────────┤
│  Topic / Objective                                       │
│  [____________________________________]                  │
│                                                          │
│  Debater A                          Debater B            │
│  ┌─────────────┐                    ┌─────────────┐      │
│  │ 🤖 Claude   │       VS          │ 🤖 GPT-4    │      │
│  │ 3.5 Sonnet  │                   │  Turbo      │      │
│  └─────────────┘                    └─────────────┘      │
│  [Dropdown: model]                  [Dropdown: model]    │
│                                                          │
│  [Optional: Custom objective for A] [Optional: Custom    │
│                                      objective for B]    │
│                                                          │
│  Settings:                                               │
│  ○ Max turns: [10]  ○ Winning condition: [Self-terminate│
│                                                    ...]  │
│                                                          │
│           [ 🚀 Start Debate ]                            │
└─────────────────────────────────────────────────────────┘
```

**Route: `/debate/[id]` - Live Debate View**
```
┌─────────────────────────────────────────────────────────┐
│  ⏸  │  Debate: "Best algorithm for sorting 1M items"   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │ 🤖 Claude        │    │ 🤖 GPT-4         │          │
│  │ Thinking...      │    │                  │          │
│  │                  │    │                  │          │
│  │ I believe merge  │    │                  │          │
│  │ sort is optimal  │    │                  │          │
│  │ because... ████  │    │                  │          │
│  │                  │    │                  │          │
│  │ [View reasoning] │    │                  │          │
│  └──────────────────┘    └──────────────────┘          │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Your controls: [Pause] [Skip turn] [Inject 💬]  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Debate Log:                                            │
│  ─────────────────────────────────────────────────────  │
│  Turn 1 (Claude): Merge sort O(n log n)...              │
│  Turn 2 (GPT-4): Actually, for 1M items, quicksort...   │
│  Turn 3 (Claude): *typing*                              │
└─────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `DebateCard` | Shows one debater's response with streaming text |
| `DebateStream` | SSE connection handler, manages live updates |
| `TurnIndicator` | Shows who's speaking, turn count, time elapsed |
| `ControlBar` | Pause, skip, inject comment buttons |
| `ReasoningToggle` | Collapsible panel for LLM reasoning (filtered from opponent) |
| `WinnerBadge` | Shows winner + reasoning when debate ends |

---

## Data Flow & State Management

### Debate State Machine

```
CREATED → RUNNING → PAUSED → RUNNING → COMPLETED
              ↓
            ABORTED (user ends early)
```

### Data Types

```typescript
// Core entities
type Debate = {
  id: string;
  topic: string;
  format: 'turn-based';
  maxTurns: number;
  winningCondition: 'self-terminate' | 'user-decides' | 'ai-judge';
  
  debaterA: DebaterConfig;  // model, systemPrompt, objective?
  debaterB: DebaterConfig;
  
  turns: Turn[];
  status: 'created' | 'running' | 'paused' | 'completed' | 'aborted';
  winner?: 'A' | 'B' | 'draw' | null;
  currentSpeaker: 'A' | 'B';
  
  createdAt: Date;
  updatedAt: Date;
};

type Turn = {
  number: number;
  speaker: 'A' | 'B';
  content: string;           // What opponent sees
  reasoning?: string;        // Private reasoning (filtered)
  timestamp: Date;
};

type UserAction = {
  type: 'pause' | 'resume' | 'skip' | 'inject';
  payload?: string;          // For inject: user's comment
};
```

### SSE Event Stream

The client receives these events in order:

```javascript
// 1. Debate starts
{ type: 'debate.started', debate: Debate }

// 2. Turn begins (who's speaking)
{ type: 'turn.started', speaker: 'A', turnNumber: 3 }

// 3. Content streams token by token
{ type: 'token', speaker: 'A', content: 'merge' }
{ type: 'token', speaker: 'A', content: ' sort' }
{ type: 'token', speaker: 'A', content: ' is' }
// ... etc

// 4. Turn complete
{ type: 'turn.completed', speaker: 'A', fullContent: '...' }

// 5. Debate ends
{ type: 'debate.completed', winner: 'A', reason: '...' }

// 6. Or: User action processed
{ type: 'action.processed', action: UserAction }
```

### State Storage (MVP)

**In-memory Map** with periodic cleanup:
```typescript
// debates.ts (server module)
const debates = new Map<string, Debate>();

// Debates auto-expire after 24h to prevent memory leaks
setInterval(() => cleanupOldDebates(), 60 * 60 * 1000);
```

---

## Error Handling & Edge Cases

### What Happens When...

| Scenario | Behavior |
|----------|----------|
| **LLM API fails** | Retry once, then mark turn as "error" and skip to next debater. Log for debugging. |
| **Debate takes too long** | 30-second timeout per turn. If hit, truncate and continue. |
| **User closes browser** | Debate continues server-side. Reconnecting resumes from current state. |
| **Both LLMs agree immediately** | Detect agreement keywords ("I agree", "concede", "you're right") → trigger early termination |
| **Infinite loop (no progress)** | Track similarity between turns. If 3 consecutive turns are >90% similar, auto-end as draw. |
| **Injected comment during streaming** | Queue the action, apply after current turn completes. |

### Error UI

- **Transient errors** (API timeout): Auto-retry, show subtle "Retrying..." indicator
- **Permanent errors** (API key invalid): Stop debate, show error banner with "Check configuration" link
- **Debate stuck**: "Debate seems stuck" button → offer to force end or skip turn

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State:** React hooks + Server-sent events
- **LLM API:** OpenRouter (initial provider)
- **Deployment:** Vercel

---

## Open Questions (Post-MVP)

1. **Persistence:** Move from in-memory to Redis/DB for multi-server deployments
2. **Multi-provider:** Support direct Anthropic, OpenAI, local model APIs
3. **History:** Save completed debates, allow replay/sharing
4. **Analytics:** Track which models win most often, popular topics
5. **Advanced formats:** Structured debate (opening/rebuttal/closing), simultaneous argument

---

## Approval

Design approved by: @yazankittaneh  
Date: 2025-02-15

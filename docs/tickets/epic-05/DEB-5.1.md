---
id: DEB-5.1
title: Create Debate Orchestrator
ePic: Debate Engine (Server-Side)
priority: P0
status: TODO
points: 8
assignee: TBD
labels: [convex, engine, orchestration]
---

## Description
Build the server-side debate engine that manages turns, streaming, and state transitions.

## Acceptance Criteria
- [ ] Create `runDebateTurn` Convex action
- [ ] Implement turn state machine (CREATED → RUNNING → COMPLETED)
- [ ] Manage current speaker rotation (A → B → A → B)
- [ ] Stream tokens to subscribers in real-time
- [ ] Record completed turns in Convex
- [ ] Check for debate end conditions:
  - Max turns reached
  - Agreement detected
  - Circular arguments detected
- [ ] Handle pause/resume states
- [ ] Implement error recovery

## Files Created
- `convex/debateEngine.ts`

## Definition of Done
- [ ] Debate runs automatically turn-by-turn
- [ ] State persists in Convex
- [ ] Subscribers receive real-time updates

## Code Template
```typescript
// convex/debateEngine.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const runDebateTurn = action({
  args: { debateId: v.id("debates") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const debate = await ctx.runQuery(internal.debates.getDebate, { 
      id: args.debateId 
    });
    
    if (!debate || debate.status !== 'running') {
      return false;
    }
    
    // Check if max turns reached
    const turnCount = await ctx.runQuery(internal.turns.getTurnCount, {
      debateId: args.debateId,
    });
    
    if (turnCount >= debate.maxTurns * 2) {
      await ctx.runMutation(internal.debates.updateDebate, {
        id: args.debateId,
        updates: { status: 'completed' },
      });
      return false;
    }
    
    // Get current speaker and their config
    const speaker = debate.currentSpeaker;
    const debater = speaker === 'A' ? debate.debaterA : debate.debaterB;
    const opponent = speaker === 'A' ? debate.debaterB : debate.debaterA;
    
    // Get previous turns
    const turns = await ctx.runQuery(internal.turns.getDebateTurns, {
      debateId: args.debateId,
    });
    
    // Stream LLM response
    // ... streaming logic here
    
    // Check for end conditions
    // ... agreement detection, circular arguments
    
    // Switch speaker for next turn
    await ctx.runMutation(internal.debates.updateDebate, {
      id: args.debateId,
      updates: { currentSpeaker: speaker === 'A' ? 'B' : 'A' },
    });
    
    return true;
  },
});

export const startDebate = action({
  args: { debateId: v.id("debates") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.debates.updateDebate, {
      id: args.debateId,
      updates: { status: 'running' },
    });
    
    // Start the turn loop
    await ctx.runAction(internal.debateEngine.runDebateTurn, {
      debateId: args.debateId,
    });
    
    return true;
  },
});
```

## Dependencies
- DEB-2.1 (TypeScript types)
- DEB-3.1 (Queries)
- DEB-3.2 (Mutations)
- DEB-4.1 (LLM client)
- DEB-4.2 (Prompt builder)
- DEB-4.3 (Intelligence)

## Blocks
5.2, 8.2

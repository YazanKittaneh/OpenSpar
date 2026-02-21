---
id: DEB-3.2
title: Create Debate Mutations
ePic: Convex Data Layer
priority: P0
status: TODO
points: 3
assignee: TBD
labels: [convex, mutations, database]
---

## Description
Implement Convex mutations for creating and updating debates.

## Acceptance Criteria
- [ ] Create `createDebate` mutation
- [ ] Create `updateDebate` mutation
- [ ] Create `addTurn` mutation
- [ ] Create `updateDebateStatus` mutation
- [ ] Create `deleteDebate` mutation (for cleanup)
- [ ] Add input validation

## Files Created
- `convex/debates.ts` (mutations)

## Definition of Done
- [ ] Mutations work in Convex dashboard
- [ ] Data persists correctly

## Code Template
```typescript
// convex/debates.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createDebate = mutation({
  args: {
    topic: v.string(),
    maxTurns: v.number(),
    winningCondition: v.union(
      v.literal("self-terminate"),
      v.literal("user-decides"),
      v.literal("ai-judge")
    ),
    debaterA: v.object({
      model: v.string(),
      name: v.string(),
      systemPrompt: v.optional(v.string()),
      objective: v.optional(v.string()),
    }),
    debaterB: v.object({
      model: v.string(),
      name: v.string(),
      systemPrompt: v.optional(v.string()),
      objective: v.optional(v.string()),
    }),
  },
  returns: v.id("debates"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("debates", {
      ...args,
      format: "turn-based",
      status: "created",
      currentSpeaker: "A",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDebate = mutation({
  args: {
    id: v.id("debates"),
    updates: v.object({
      status: v.optional(v.any()),
      winner: v.optional(v.any()),
      currentSpeaker: v.optional(v.any()),
    }),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const addTurn = mutation({
  args: {
    debateId: v.id("debates"),
    number: v.number(),
    speaker: v.union(v.literal("A"), v.literal("B")),
    content: v.string(),
    reasoning: v.optional(v.string()),
  },
  returns: v.id("turns"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("turns", {
      ...args,
      timestamp: Date.now(),
    });
  },
});
```

## Dependencies
- DEB-1.5 (Convex initialized)
- DEB-2.2 (Convex schema)

## Blocks
5.1, 6.1, 7.2

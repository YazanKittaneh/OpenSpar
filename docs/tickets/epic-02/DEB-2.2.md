---
id: DEB-2.2
title: Define Convex Schema
ePic: Type System & Core Types
priority: P0
status: TODO
points: 3
assignee: TBD
labels: [convex, schema, database]
---

## Description
Define the Convex database schema for storing debates, turns, and user actions.

## Acceptance Criteria
- [ ] Create `convex/schema.ts` with debate table
- [ ] Define schema for `debates` table matching TypeScript types
- [ ] Define schema for `turns` table
- [ ] Add proper indexes for efficient queries
- [ ] Configure validation rules

## Files Created
- `convex/schema.ts`

## Definition of Done
- [ ] Schema pushes to Convex without errors
- [ ] Types align with TypeScript definitions

## Code Template
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  debates: defineTable({
    topic: v.string(),
    format: v.literal("turn-based"),
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
    status: v.union(
      v.literal("created"),
      v.literal("running"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("aborted")
    ),
    winner: v.optional(v.union(v.literal("A"), v.literal("B"), v.literal("draw"))),
    currentSpeaker: v.union(v.literal("A"), v.literal("B")),
    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  turns: defineTable({
    debateId: v.id("debates"),
    number: v.number(),
    speaker: v.union(v.literal("A"), v.literal("B")),
    content: v.string(),
    reasoning: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_debateId", ["debateId"])
    .index("by_debateId_number", ["debateId", "number"]),
});
```

## Dependencies
- DEB-1.5 (Convex initialized)
- DEB-2.1 (TypeScript types defined)

## Blocks
3.1, 3.2, 3.3

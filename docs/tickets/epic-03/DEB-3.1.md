---
id: DEB-3.1
title: Create Debate Queries
ePic: Convex Data Layer
priority: P0
status: TODO
points: 3
assignee: TBD
labels: [convex, queries, database]
---

## Description
Implement Convex queries for retrieving debates and related data.

## Acceptance Criteria
- [ ] Create `getDebate` query - fetch single debate by ID
- [ ] Create `getActiveDebates` query - list running debates
- [ ] Create `getDebateTurns` query - fetch turns for a debate
- [ ] Add pagination support for turns
- [ ] Implement proper authorization (if needed)

## Files Created
- `convex/debates.ts`
- `convex/turns.ts`

## Definition of Done
- [ ] Queries return correct data from Convex
- [ ] Type-safe with proper error handling

## Code Template
```typescript
// convex/debates.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDebate = query({
  args: { id: v.id("debates") },
  returns: v.any(), // Define proper return type
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getActiveDebates = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db
      .query("debates")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect();
  },
});

// convex/turns.ts
export const getDebateTurns = query({
  args: { 
    debateId: v.id("debates"),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    turns: v.array(v.any()),
    nextCursor: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const turns = await ctx.db
      .query("turns")
      .withIndex("by_debateId_number", (q) => 
        q.eq("debateId", args.debateId)
      )
      .order("desc")
      .take(limit);
    
    return { turns: turns.reverse() };
  },
});
```

## Dependencies
- DEB-1.5 (Convex initialized)
- DEB-2.1 (TypeScript types)
- DEB-2.2 (Convex schema)

## Blocks
5.1, 6.1, 8.2

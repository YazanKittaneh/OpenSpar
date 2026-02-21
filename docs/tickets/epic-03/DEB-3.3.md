---
id: DEB-3.3
title: Create Real-time Subscriptions
ePic: Convex Data Layer
priority: P0
status: TODO
points: 5
assignee: TBD
labels: [convex, subscriptions, realtime]
---

## Description
Implement Convex subscriptions for real-time debate updates (replacement for SSE).

## Acceptance Criteria
- [ ] Create `watchDebate` subscription for live debate updates
- [ ] Create `watchTurns` subscription for streaming turns
- [ ] Handle connection state management
- [ ] Implement reconnection logic
- [ ] Optimize subscription performance

## Files Created
- `convex/subscriptions.ts`

## Definition of Done
- [ ] Subscriptions push updates in real-time
- [ ] Frontend receives updates without polling

## Code Template
```typescript
// convex/subscriptions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const watchDebate = query({
  args: { id: v.id("debates") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const watchTurns = query({
  args: { 
    debateId: v.id("debates"),
    afterNumber: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("turns")
      .withIndex("by_debateId_number", (q) => 
        q.eq("debateId", args.debateId)
      );
    
    if (args.afterNumber !== undefined) {
      query = query.filter((q) => q.gt(q.field("number"), args.afterNumber!));
    }
    
    return await query.order("asc").collect();
  },
});
```

## Dependencies
- DEB-1.5 (Convex initialized)
- DEB-2.2 (Convex schema)
- DEB-3.1 (Queries)

## Blocks
8.2 (Real-time streaming)

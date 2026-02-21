---
id: DEB-5.2
title: Implement User Actions Handler
ePic: Debate Engine (Server-Side)
priority: P1
status: TODO
points: 3
assignee: TBD
labels: [convex, actions, user-controls]
---

## Description
Handle user actions (pause, resume, skip, inject) during debates.

## Acceptance Criteria
- [ ] Create `processUserAction` mutation
- [ ] Implement `pause` action - stops turn progression
- [ ] Implement `resume` action - continues debate
- [ ] Implement `skip` action - skips current debater
- [ ] Implement `inject` action - adds user comment as special turn
- [ ] Queue actions during streaming
- [ ] Broadcast action events to subscribers

## Files Created
- `convex/actions.ts`

## Definition of Done
- [ ] All action types work correctly
- [ ] Actions queued/applied at appropriate times

## Code Template
```typescript
// convex/actions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const processUserAction = mutation({
  args: {
    debateId: v.id("debates"),
    action: v.object({
      type: v.union(
        v.literal("pause"),
        v.literal("resume"),
        v.literal("skip"),
        v.literal("inject")
      ),
      payload: v.optional(v.string()),
    }),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const debate = await ctx.db.get(args.debateId);
    if (!debate) return false;
    
    switch (args.action.type) {
      case 'pause':
        if (debate.status === 'running') {
          await ctx.db.patch(args.debateId, { status: 'paused' });
        }
        break;
        
      case 'resume':
        if (debate.status === 'paused') {
          await ctx.db.patch(args.debateId, { status: 'running' });
          // Trigger next turn
        }
        break;
        
      case 'skip':
        await ctx.db.patch(args.debateId, {
          currentSpeaker: debate.currentSpeaker === 'A' ? 'B' : 'A',
        });
        break;
        
      case 'inject':
        if (args.action.payload) {
          const turnCount = await ctx.db
            .query("turns")
            .withIndex("by_debateId", (q) => q.eq("debateId", args.debateId))
            .collect();
          
          await ctx.db.insert("turns", {
            debateId: args.debateId,
            number: turnCount.length + 1,
            speaker: debate.currentSpeaker,
            content: `[User]: ${args.action.payload}`,
            timestamp: Date.now(),
          });
        }
        break;
    }
    
    return true;
  },
});
```

## Dependencies
- DEB-2.1 (TypeScript types)
- DEB-3.2 (Mutations)
- DEB-5.1 (Debate orchestrator)

## Blocks
6.3, 8.4

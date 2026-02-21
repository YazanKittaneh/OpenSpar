---
id: DEB-9.3
title: Implement Debate Cleanup
ePic: Error Handling & Edge Cases
priority: P2
status: TODO
points: 2
assignee: TBD
labels: [maintenance, cleanup, convex]
---

## Description
Add automatic cleanup of old debates to prevent storage bloat.

## Acceptance Criteria
- [ ] Create cleanup Convex action
- [ ] Delete debates older than 24 hours
- [ ] Schedule cleanup to run hourly
- [ ] Log cleanup activity

## Files Created
- `convex/cleanup.ts`
- `convex/cron.ts`

## Definition of Done
- [ ] Old debates auto-deleted
- [ ] Cleanup runs on schedule

## Code Template
```typescript
// convex/cleanup.ts
import { internalAction } from "./_generated/server";

export const cleanupOldDebates = internalAction({
  args: {},
  handler: async (ctx) => {
    const CUTOFF_MS = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = Date.now() - CUTOFF_MS;
    
    const oldDebates = await ctx.db
      .query("debates")
      .withIndex("by_createdAt", (q) => q.lt(cutoff))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();
    
    let deletedCount = 0;
    for (const debate of oldDebates) {
      // Delete associated turns first
      const turns = await ctx.db
        .query("turns")
        .withIndex("by_debateId", (q) => q.eq("debateId", debate._id))
        .collect();
      
      for (const turn of turns) {
        await ctx.db.delete(turn._id);
      }
      
      await ctx.db.delete(debate._id);
      deletedCount++;
    }
    
    console.log(`Cleaned up ${deletedCount} old debates`);
    return deletedCount;
  },
});

// convex/cron.ts (schedule the cleanup)
import { cronJobs } from "@convex-dev/cron";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "cleanup old debates",
  internal.cleanup.cleanupOldDebates,
  {},
);

export default crons;
```

## Dependencies
- DEB-2.2 (Convex schema)

## Blocks
None

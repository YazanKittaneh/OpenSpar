import { v } from "convex/values";

import { internalMutation, query } from "./_generated/server";

const CUTOFF_MS = 24 * 60 * 60 * 1000;

export const getOldCompletedDebateIds = query({
  args: {
    cutoff: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cutoff = args.cutoff ?? Date.now() - CUTOFF_MS;

    const oldDebates = await ctx.db
      .query("debates")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", cutoff))
      .collect();

    return oldDebates
      .filter((debate) => debate.status === "completed" || debate.status === "aborted")
      .map((debate) => debate._id);
  },
});

export const cleanupOldDebates = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - CUTOFF_MS;

    const oldDebates = await ctx.db
      .query("debates")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", cutoff))
      .collect();

    let deletedCount = 0;
    for (const debate of oldDebates) {
      if (debate.status !== "completed" && debate.status !== "aborted") {
        continue;
      }

      const turns = await ctx.db
        .query("turns")
        .withIndex("by_debateId", (q) => q.eq("debateId", debate._id))
        .collect();

      for (const turn of turns) {
        await ctx.db.delete(turn._id);
      }

      const events = await ctx.db
        .query("debateEvents")
        .withIndex("by_debateId_createdAt", (q) => q.eq("debateId", debate._id))
        .collect();

      for (const event of events) {
        await ctx.db.delete(event._id);
      }

      const actions = await ctx.db
        .query("userActions")
        .withIndex("by_debateId_createdAt", (q) => q.eq("debateId", debate._id))
        .collect();

      for (const action of actions) {
        await ctx.db.delete(action._id);
      }

      await ctx.db.delete(debate._id);
      deletedCount += 1;
    }

    console.log(`Cleaned up ${deletedCount} old debates`);
    return { deletedCount };
  },
});

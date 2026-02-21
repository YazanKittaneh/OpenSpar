import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getDebateTurns = query({
  args: {
    debateId: v.id("debates"),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);

    const allTurns = await ctx.db
      .query("turns")
      .withIndex("by_debateId_number", (q) => q.eq("debateId", args.debateId))
      .order("asc")
      .collect();

    const start = args.cursor ?? 0;
    const turns = allTurns.slice(start, start + limit);
    const nextCursor = start + turns.length < allTurns.length ? start + turns.length : undefined;

    return { turns, nextCursor };
  },
});

export const getTurnCount = query({
  args: { debateId: v.id("debates") },
  handler: async (ctx, args) => {
    const turns = await ctx.db
      .query("turns")
      .withIndex("by_debateId", (q) => q.eq("debateId", args.debateId))
      .collect();

    return turns.length;
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
  handler: async (ctx, args) => {
    return ctx.db.insert("turns", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

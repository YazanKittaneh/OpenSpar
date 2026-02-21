import { v } from "convex/values";
import { query } from "./_generated/server";

export const watchDebate = query({
  args: { id: v.id("debates") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const watchTurns = query({
  args: {
    debateId: v.id("debates"),
    afterNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const turns = await ctx.db
      .query("turns")
      .withIndex("by_debateId_number", (q) => q.eq("debateId", args.debateId))
      .order("asc")
      .collect();

    if (args.afterNumber === undefined) {
      return turns;
    }

    return turns.filter((turn) => turn.number > args.afterNumber!);
  },
});

export const watchEvents = query({
  args: {
    debateId: v.id("debates"),
    afterSequence: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("debateEvents")
      .withIndex("by_debateId_sequence", (q) => q.eq("debateId", args.debateId))
      .order("asc")
      .collect();

    const after = args.afterSequence;
    const filtered =
      after === undefined
        ? events
        : events.filter((event) => event.sequence > after);

    return filtered.slice(0, args.limit ?? 200);
  },
});

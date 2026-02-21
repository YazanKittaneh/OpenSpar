import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const appendEvent = mutation({
  args: {
    debateId: v.id("debates"),
    type: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    const latest = await ctx.db
      .query("debateEvents")
      .withIndex("by_debateId_sequence", (q) => q.eq("debateId", args.debateId))
      .order("desc")
      .first();

    const nextSequence = latest ? latest.sequence + 1 : 1;

    return ctx.db.insert("debateEvents", {
      debateId: args.debateId,
      sequence: nextSequence,
      type: args.type,
      payload: args.payload,
      createdAt: Date.now(),
    });
  },
});

export const getEvents = query({
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

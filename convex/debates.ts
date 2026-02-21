import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getDebate = query({
  args: { id: v.id("debates") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const getActiveDebates = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("debates")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .order("desc")
      .collect();
  },
});

export const createDebate = mutation({
  args: {
    topic: v.string(),
    maxTurns: v.number(),
    winningCondition: v.union(
      v.literal("self-terminate"),
      v.literal("user-decides"),
      v.literal("ai-judge"),
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
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("debates", {
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
      status: v.optional(
        v.union(
          v.literal("created"),
          v.literal("running"),
          v.literal("paused"),
          v.literal("completed"),
          v.literal("aborted"),
        ),
      ),
      winner: v.optional(
        v.union(v.literal("A"), v.literal("B"), v.literal("draw")),
      ),
      currentSpeaker: v.optional(v.union(v.literal("A"), v.literal("B"))),
      topic: v.optional(v.string()),
      maxTurns: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const updateDebateStatus = mutation({
  args: {
    id: v.id("debates"),
    status: v.union(
      v.literal("created"),
      v.literal("running"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("aborted"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const deleteDebate = mutation({
  args: { id: v.id("debates") },
  handler: async (ctx, args) => {
    const relatedTurns = await ctx.db
      .query("turns")
      .withIndex("by_debateId", (q) => q.eq("debateId", args.id))
      .collect();

    for (const turn of relatedTurns) {
      await ctx.db.delete(turn._id);
    }

    await ctx.db.delete(args.id);
    return true;
  },
});

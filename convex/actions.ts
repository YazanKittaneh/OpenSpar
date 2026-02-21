import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const processUserAction = mutation({
  args: {
    debateId: v.id("debates"),
    action: v.object({
      type: v.union(
        v.literal("pause"),
        v.literal("resume"),
        v.literal("skip"),
        v.literal("inject"),
      ),
      payload: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const debate = await ctx.db.get(args.debateId);
    if (!debate) return false;

    const now = Date.now();

    await ctx.db.insert("userActions", {
      debateId: args.debateId,
      type: args.action.type,
      payload: args.action.payload,
      createdAt: now,
      processedAt: now,
    });

    switch (args.action.type) {
      case "pause": {
        if (debate.status === "running") {
          await ctx.db.patch(args.debateId, { status: "paused", updatedAt: now });
        }
        break;
      }
      case "resume": {
        if (debate.status === "paused") {
          await ctx.db.patch(args.debateId, { status: "running", updatedAt: now });
        }
        break;
      }
      case "skip": {
        await ctx.db.patch(args.debateId, {
          currentSpeaker: debate.currentSpeaker === "A" ? "B" : "A",
          updatedAt: now,
        });
        break;
      }
      case "inject": {
        if (args.action.payload) {
          const turns = await ctx.db
            .query("turns")
            .withIndex("by_debateId", (q) => q.eq("debateId", args.debateId))
            .collect();

          await ctx.db.insert("turns", {
            debateId: args.debateId,
            number: turns.length + 1,
            speaker: debate.currentSpeaker,
            content: `[User]: ${args.action.payload}`,
            timestamp: now,
          });
        }
        break;
      }
      default:
        break;
    }

    const latestEvent = await ctx.db
      .query("debateEvents")
      .withIndex("by_debateId_sequence", (q) => q.eq("debateId", args.debateId))
      .order("desc")
      .first();

    await ctx.db.insert("debateEvents", {
      debateId: args.debateId,
      sequence: latestEvent ? latestEvent.sequence + 1 : 1,
      type: "action.processed",
      payload: JSON.stringify(args.action),
      createdAt: now,
    });

    return true;
  },
});

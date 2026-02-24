import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  debates: defineTable({
    topic: v.string(),
    format: v.literal("turn-based"),
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
    status: v.union(
      v.literal("created"),
      v.literal("running"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("aborted"),
    ),
    winner: v.optional(v.union(v.literal("A"), v.literal("B"), v.literal("draw"))),
    currentSpeaker: v.union(v.literal("A"), v.literal("B")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  turns: defineTable({
    debateId: v.id("debates"),
    number: v.number(),
    speaker: v.union(v.literal("A"), v.literal("B")),
    content: v.string(),
    reasoning: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_debateId", ["debateId"])
    .index("by_debateId_number", ["debateId", "number"]),

  userActions: defineTable({
    debateId: v.id("debates"),
    type: v.union(
      v.literal("pause"),
      v.literal("resume"),
      v.literal("skip"),
      v.literal("inject"),
      v.literal("stop"),
    ),
    payload: v.optional(v.string()),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  }).index("by_debateId_createdAt", ["debateId", "createdAt"]),

  debateEvents: defineTable({
    debateId: v.id("debates"),
    sequence: v.number(),
    type: v.string(),
    payload: v.string(),
    createdAt: v.number(),
  })
    .index("by_debateId_sequence", ["debateId", "sequence"])
    .index("by_debateId_createdAt", ["debateId", "createdAt"]),

  userApiKeys: defineTable({
    userId: v.string(),
    ciphertext: v.string(),
    iv: v.string(),
    keyVersion: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});

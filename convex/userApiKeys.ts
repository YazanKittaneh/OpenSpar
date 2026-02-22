import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

async function requireUserId(ctx: {
  auth: {
    getUserIdentity: () => Promise<{ subject: string } | null>;
  };
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required.");
  }
  return identity.subject;
}

export const saveMyApiKey = mutation({
  args: {
    ciphertext: v.string(),
    iv: v.string(),
    keyVersion: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("userApiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ciphertext: args.ciphertext,
        iv: args.iv,
        keyVersion: args.keyVersion,
        updatedAt: now,
      });
      return { saved: true, updated: true };
    }

    await ctx.db.insert("userApiKeys", {
      userId,
      ciphertext: args.ciphertext,
      iv: args.iv,
      keyVersion: args.keyVersion,
      createdAt: now,
      updatedAt: now,
    });

    return { saved: true, updated: false };
  },
});

export const getMyEncryptedApiKey = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const record = await ctx.db
      .query("userApiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!record) {
      return null;
    }

    return {
      ciphertext: record.ciphertext,
      iv: record.iv,
      keyVersion: record.keyVersion,
      updatedAt: record.updatedAt,
    };
  },
});

export const deleteMyApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const record = await ctx.db
      .query("userApiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!record) {
      return { deleted: false };
    }

    await ctx.db.delete(record._id);
    return { deleted: true };
  },
});

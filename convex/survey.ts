import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function generateUid(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uid = "";
  for (let i = 0; i < 5; i++) {
    uid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uid;
}

export const submitResponse = mutation({
  args: {
    responses: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const surveyResponseId = await ctx.db.insert("surveyResponses", {
      responses: args.responses,
    });

    let uid = generateUid();

    let existing = await ctx.db
      .query("conversations")
      .withIndex("by_uid", (q) => q.eq("uid", uid))
      .first();

    while (existing) {
      uid = generateUid();
      existing = await ctx.db
        .query("conversations")
        .withIndex("by_uid", (q) => q.eq("uid", uid))
        .first();
    }

    const conversationId = await ctx.db.insert("conversations", {
      uid,
      title: args.title || "New Conversation",
      surveyResponseId,
      updatedAt: Date.now(),
    });

    return {
      uid,
      surveyResponseId,
      conversationId,
    };
  },
});

export const getResponseById = query({
  args: { id: v.id("surveyResponses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAllResponses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("surveyResponses").collect();
  },
});

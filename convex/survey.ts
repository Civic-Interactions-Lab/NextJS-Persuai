import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submitResponse = mutation({
  args: {
    surveyId: v.id("surveys"),
    conversationId: v.optional(v.id("conversations")),
    externalId: v.string(),
    type: v.union(v.literal("pre"), v.literal("post")),
    answers: v.array(
      v.object({
        questionId: v.string(),
        value: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("surveyResponses", {
      surveyId: args.surveyId,
      conversationId: args.conversationId,
      externalId: args.externalId,
      type: args.type,
      answers: args.answers,
      submittedAt: Date.now(),
    });
  },
});

export const getResponseById = query({
  args: { id: v.id("surveyResponses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getResponsesByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("surveyResponses")
      .withIndex("by_external", (q) => q.eq("externalId", args.externalId))
      .collect();
  },
});

export const getResponsesByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("surveyResponses")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();
  },
});

export const getAllResponses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("surveyResponses").collect();
  },
});

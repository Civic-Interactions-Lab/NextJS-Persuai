import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
  args: {
    externalId: v.string(),
    externalStudyId: v.optional(v.string()),
    externalSessionId: v.optional(v.string()),
    title: v.string(),
    topic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      externalId: args.externalId,
      externalStudyId: args.externalStudyId,
      externalSessionId: args.externalSessionId,
      title: args.title,
      topic: args.topic,
      updatedAt: Date.now(),
    });
  },
});

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();
  },
});

export const getConversationById = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getConversationByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_external", (q) => q.eq("externalId", args.externalId))
      .first();
  },
});

export const updateTitle = mutation({
  args: {
    id: v.id("conversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const updateTopicAndAgent = mutation({
  args: {
    id: v.id("conversations"),
    topic: v.string(),
    topicPrompt: v.string(),
    agentId: v.string(),
    agentName: v.string(),
    agentPosition: v.union(
      v.literal("agree"),
      v.literal("disagree"),
      v.literal("neutral"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      topic: args.topic,
      topicPrompt: args.topicPrompt,
      agentId: args.agentId,
      agentName: args.agentName,
      agentPosition: args.agentPosition,
      updatedAt: Date.now(),
    });
  },
});

// export const updateSurveyResponse = mutation({
//   args: {
//     id: v.id("conversations"),
//     type: v.union(v.literal("pre"), v.literal("post")),
//     surveyResponseId: v.id("surveyResponses"),
//   },
//   handler: async (ctx, args) => {
//     await ctx.db.patch(args.id, {
//       ...(args.type === "pre"
//         ? { preSurveyResponseId: args.surveyResponseId }
//         : { postSurveyResponseId: args.surveyResponseId }),
//       updatedAt: Date.now(),
//     });
//   },
// });

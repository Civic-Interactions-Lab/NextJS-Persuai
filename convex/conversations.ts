import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Not really need this
export const createConversation = mutation({
  args: {
    uid: v.string(),
    title: v.string(),
    topic: v.string(),
    surveyResponseId: v.id("surveyResponses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      uid: args.uid,
      title: args.title,
      topic: args.topic,
      surveyResponseId: args.surveyResponseId,
      updatedAt: Date.now(),
    });
  },
});

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("conversations").order("desc").collect();
  },
});

export const getConversationById = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getConversationByUid = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_uid", (q) => q.eq("uid", args.uid))
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

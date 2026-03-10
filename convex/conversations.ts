import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
  args: {
    externalId: v.string(),
    externalStudyId: v.optional(v.string()),
    externalSessionId: v.optional(v.string()),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      externalId: args.externalId,
      externalStudyId: args.externalStudyId,
      externalSessionId: args.externalSessionId,
      status: "active",
      title: args.title,
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

export const getConversationsForExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_external", (q) => q.eq("externalId", args.externalId))
      .order("desc")
      .collect();
  },
});

export const completeConversation = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "complete",
      updatedAt: Date.now(),
    });
  },
});

export const getConversationById = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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
    topicId: v.id("topics"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    const agent = await ctx.db.get(args.agentId);

    if (!topic || !agent) throw new Error("Topic or agent not found");

    await ctx.db.patch(args.id, {
      topicId: args.topicId,
      agentId: args.agentId,
      metadata: {
        topic: {
          label: topic.label,
          prompt: topic.prompt,
        },
        agent: {
          name: agent.name,
          position: agent.position,
          description: agent.description,
          systemPrompt: agent.systemPrompt,
        },
      },
      updatedAt: Date.now(),
    });
  },
});

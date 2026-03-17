import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
  args: {
    externalId: v.string(),
    externalStudyId: v.optional(v.string()),
    externalSessionId: v.optional(v.string()),
    title: v.string(),
    topicId: v.id("topics"),
  },
  handler: async (ctx, args) => {
    const agents = await ctx.db.query("agents").collect();
    const randomAgent = agents.length
      ? agents[Math.floor(Math.random() * agents.length)]
      : null;

    return await ctx.db.insert("conversations", {
      externalId: args.externalId,
      externalStudyId: args.externalStudyId,
      externalSessionId: args.externalSessionId,
      title: args.title,
      agentId: randomAgent?._id,
      topicId: args.topicId,
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

export const getConversationForExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("conversations")
      .withIndex("by_external", (q) => q.eq("externalId", args.externalId))
      .order("desc")
      .first(),
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

export const update = mutation({
  args: {
    id: v.id("conversations"),
    topicId: v.id("topics"),
  },
  handler: async (ctx, args) => {
    const topic = await ctx.db.get(args.topicId);
    const conversation = await ctx.db.get(args.id);
    const agent = conversation?.agentId
      ? await ctx.db.get(conversation.agentId)
      : null;

    if (!topic || !agent) throw new Error("Topic or agent not found");

    await ctx.db.patch(args.id, {
      topicId: args.topicId,
      metadata: {
        topic: {
          title: topic.title,
          issue: topic.issue,
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

export const getConversationWithAgentAndTopic = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.id);
    if (!conversation) return null;

    const agent = conversation.agentId
      ? await ctx.db.get(conversation.agentId)
      : null;

    const topic = conversation.topicId
      ? await ctx.db.get(conversation.topicId)
      : null;

    return { conversation, agent, topic };
  },
});

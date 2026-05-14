import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

const statusValidator = v.union(
  v.literal("idle"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("error"),
);

export const create = mutation({
  args: {
    title: v.string(),
    personaId: v.id("llmPersonas"),
    agentId: v.id("agents"),
    topicId: v.id("topics"),
    maxRounds: v.number(),
  },
  handler: async (ctx, args) => {
    const [persona, agent, topic] = await Promise.all([
      ctx.db.get(args.personaId),
      ctx.db.get(args.agentId),
      ctx.db.get(args.topicId),
    ]);

    if (!agent) throw new Error("Agent not found");

    return ctx.db.insert("llmConversations", {
      title: args.title,
      personaId: args.personaId,
      agentId: args.agentId,
      topicId: args.topicId,
      status: "idle",
      roundCount: 0,
      maxRounds: args.maxRounds,
      metadata: { persona: { ...persona, stance: "" }, agent, topic },
      updatedAt: Date.now(),
    });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query("llmConversations")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect(),
});

export const getById = query({
  args: { id: v.id("llmConversations") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const updateStatus = mutation({
  args: {
    id: v.id("llmConversations"),
    status: statusValidator,
  },
  handler: async (ctx, args) =>
    ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() }),
});

export const incrementRound = mutation({
  args: { id: v.id("llmConversations") },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.id);
    if (!conv) return;
    const newCount = conv.roundCount + 1;
    const isDone = newCount >= conv.maxRounds;
    await ctx.db.patch(args.id, {
      roundCount: newCount,
      status: isDone ? "completed" : conv.status,
      updatedAt: Date.now(),
    });
  },
});

export const updateTitle = mutation({
  args: { id: v.id("llmConversations"), title: v.string() },
  handler: async (ctx, args) =>
    ctx.db.patch(args.id, { title: args.title, updatedAt: Date.now() }),
});

export const updateTopicRating = mutation({
  args: {
    id: v.id("llmConversations"),
    type: v.union(v.literal("pre"), v.literal("post")),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const field = args.type === "pre" ? "preTopicRating" : "postTopicRating";
    await ctx.db.patch(args.id, {
      [field]: args.rating,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("llmConversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("llmMessages")
      .withIndex("by_llm_conversation", (q) =>
        q.eq("llmConversationId", args.id),
      )
      .collect();
    await Promise.all(messages.map((m) => ctx.db.delete(m._id)));
    await ctx.db.delete(args.id);
  },
});

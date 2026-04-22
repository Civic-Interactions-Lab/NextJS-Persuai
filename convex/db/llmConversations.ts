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
    topicId: v.id("topics"),
    maxRounds: v.number(),
  },
  handler: async (ctx, args) => {
    // Randomly assign an agent
    const agents = await ctx.db.query("agents").collect();
    if (agents.length === 0) throw new Error("No agents available");
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];

    const [persona, topic] = await Promise.all([
      ctx.db.get(args.personaId),
      ctx.db.get(args.topicId),
    ]);

    return ctx.db.insert("llmConversations", {
      title: args.title,
      personaId: args.personaId,
      agentId: randomAgent._id,
      topicId: args.topicId,
      status: "idle",
      roundCount: 0,
      maxRounds: args.maxRounds,
      metadata: { persona, agent: randomAgent, topic },
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

export const remove = mutation({
  args: { id: v.id("llmConversations") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

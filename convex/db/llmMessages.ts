import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getMessages = query({
  args: { llmConversationId: v.id("llmConversations") },
  handler: async (ctx, args) =>
    ctx.db
      .query("llmMessages")
      .withIndex("by_llm_conversation", (q) =>
        q.eq("llmConversationId", args.llmConversationId),
      )
      .collect(),
});

export const createMessage = mutation({
  args: {
    llmConversationId: v.id("llmConversations"),
    role: v.union(v.literal("persona"), v.literal("agent")),
    content: v.string(),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error"),
    ),
    round: v.number(),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("llmMessages", { ...args, updatedAt: Date.now() }),
});

export const updateMessage = mutation({
  args: {
    id: v.id("llmMessages"),
    content: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("processing"),
        v.literal("completed"),
        v.literal("error"),
      ),
    ),
    // 1–3 = disagree, 4 = neutral, 5–7 = agree
    agreement: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();
  },
});

export const createMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    status: v.optional(
      v.union(
        v.literal("processing"),
        v.literal("completed"),
        v.literal("error"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const now = Date.now();

    await ctx.db.patch(args.conversationId, {
      updatedAt: now,
    });

    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      status: args.status ?? "processing",
      updatedAt: now,
    });
  },
});

export const updateMessage = mutation({
  args: {
    id: v.id("messages"),
    content: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("processing"),
        v.literal("completed"),
        v.literal("error"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const now = Date.now();

    const updates: {
      content?: string;
      status?: "processing" | "completed" | "error";
      updatedAt: number;
    } = {
      updatedAt: now,
    };

    if (args.content !== undefined) {
      updates.content = args.content;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
    }

    await ctx.db.patch(args.id, updates);

    // Only update once using the message's conversationId
    await ctx.db.patch(message.conversationId, {
      updatedAt: now,
    });

    return args.id;
  },
});

export const updateMessageAgreement = mutation({
  args: {
    id: v.id("messages"),
    agreement: v.number(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    await ctx.db.patch(args.id, {
      agreement: args.agreement,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

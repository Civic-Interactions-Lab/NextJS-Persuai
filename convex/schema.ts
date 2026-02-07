import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  conversations: defineTable({
    userId: v.string(),
    topic: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    isAgreed: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});

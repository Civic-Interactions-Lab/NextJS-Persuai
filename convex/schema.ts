import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  surveyResponses: defineTable({
    responses: v.string(),
  }),

  conversations: defineTable({
    uid: v.string(),
    title: v.string(),
    topic: v.string(),
    surveyResponseId: v.id("surveyResponses"),
    updatedAt: v.number(),
  })
    .index("by_uid", ["uid", "updatedAt"])
    .index("by_survey", ["surveyResponseId", "updatedAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error"),
    ),
    isAgreed: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});

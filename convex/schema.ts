import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  surveyResponses: defineTable({
    responses: v.string(),
  }),

  conversations: defineTable({
    uid: v.string(),
    title: v.string(),
    topic: v.optional(v.string()),
    topicPrompt: v.optional(v.string()),
    agentId: v.optional(v.string()),
    agentName: v.optional(v.string()),
    agentPosition: v.optional(
      v.union(v.literal("agree"), v.literal("disagree"), v.literal("neutral")),
    ),
    surveyResponseId: v.id("surveyResponses"),
    updatedAt: v.number(),
  })
    .index("by_uid", ["uid", "updatedAt"])
    .index("by_survey", ["surveyResponseId", "updatedAt"])
    .index("by_updatedAt", ["updatedAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error"),
    ),
    agreement: v.optional(
      v.union(v.literal("agree"), v.literal("disagree"), v.literal("neutral")),
    ),
    updatedAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});

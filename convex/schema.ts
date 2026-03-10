import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Surveys ────────────────────────────────────────────────────────────────

  surveyResponses: defineTable({
    conversationId: v.optional(v.id("conversations")),
    externalId: v.string(),
    type: v.union(v.literal("pre"), v.literal("post")),
    submittedAt: v.number(),
    answers: v.array(
      v.object({
        questionId: v.string(),
        value: v.string(),
      }),
    ),
  })
    .index("by_external", ["externalId"])
    .index("by_conversation", ["conversationId"]),

  // ── Conversations ──────────────────────────────────────────────────────────
  conversations: defineTable({
    externalId: v.string(), // PROLIFIC_PID
    externalStudyId: v.optional(v.string()), // STUDY_ID
    externalSessionId: v.optional(v.string()), // SESSION_ID
    title: v.string(),
    status: v.union(v.literal("active"), v.literal("complete")),
    topic: v.optional(v.string()),
    topicPrompt: v.optional(v.string()),
    agentId: v.optional(v.string()),
    agentName: v.optional(v.string()),
    agentPosition: v.optional(
      v.union(v.literal("agree"), v.literal("disagree"), v.literal("neutral")),
    ),
    preSurveyResponseId: v.optional(v.id("surveyResponses")),
    postSurveyResponseId: v.optional(v.id("surveyResponses")),
    updatedAt: v.number(),
  })
    .index("by_external", ["externalId", "updatedAt"])
    .index("by_updatedAt", ["updatedAt"]),

  // ── Messages ───────────────────────────────────────────────────────────────
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

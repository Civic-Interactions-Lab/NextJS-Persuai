import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { positionValidator } from "./types/convexTypes";
import { participantStatusValidator } from "./types/participantTypes";

export default defineSchema({
  // ── Participants ───────────────────────────────────────────────────────────
  participants: defineTable({
    externalId: v.string(),
    status: participantStatusValidator,
    submissionCode: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_external", ["externalId"]),

  // ── Conversations ──────────────────────────────────────────────────────────
  conversations: defineTable({
    externalId: v.string(),
    externalStudyId: v.optional(v.string()),
    externalSessionId: v.optional(v.string()),
    title: v.string(),
    topicId: v.optional(v.id("topics")),
    agentId: v.optional(v.id("agents")),
    metadata: v.optional(v.any()),
    preSurveyResponseId: v.optional(v.id("surveyResponses")),
    postSurveyResponseId: v.optional(v.id("surveyResponses")),
    updatedAt: v.number(),
  })
    .index("by_external", ["externalId", "updatedAt"])
    .index("by_updatedAt", ["updatedAt"]),

  agents: defineTable({
    name: v.string(),
    position: positionValidator,
    description: v.string(),
    systemPrompt: v.string(),
  }).index("by_position", ["position"]),

  topics: defineTable({
    title: v.string(),
    issue: v.string(),
  }),

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
    agreement: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

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

  // ── Consents ───────────────────────────────────────────────────────────────

  consents: defineTable({
    externalId: v.string(),
    consented: v.boolean(),
    consentedAt: v.number(),
  }).index("by_external", ["externalId"]),

  // ── Settings ───────────────────────────────────────────────────────────────

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});

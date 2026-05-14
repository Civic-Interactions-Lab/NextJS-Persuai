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

  // ── LLM Messages (LLM vs LLM) ─────────────────────────────────────────────

  llmMessages: defineTable({
    llmConversationId: v.id("llmConversations"),
    role: v.union(v.literal("persona"), v.literal("agent")),
    content: v.string(),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error"),
    ),
    // 1–3 = disagree, 4 = neutral, 5–7 = agree (Likert scale)
    agreement: v.optional(v.number()),
    round: v.number(),
    updatedAt: v.number(),
  }).index("by_llm_conversation", ["llmConversationId"]),

  // ── LLM Conversations (LLM vs LLM) ────────────────────────────────────────

  llmConversations: defineTable({
    title: v.string(),
    personaId: v.id("llmPersonas"),
    agentId: v.id("agents"),
    topicId: v.id("topics"),
    status: v.union(
      v.literal("idle"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("error"),
    ),
    roundCount: v.number(),
    maxRounds: v.number(),
    // Persona's topic rating before and after conversation (1–7 Likert)
    preTopicRating: v.optional(v.number()),
    postTopicRating: v.optional(v.number()),
    metadata: v.optional(v.any()),
    updatedAt: v.number(),
  })
    .index("by_updatedAt", ["updatedAt"])
    .index("by_status", ["status"]),

  // ── LLM Personas ──────────────────────────────────────────────────────────

  llmPersonas: defineTable({
    name: v.string(),
    bio: v.string(),
    debateStyle: v.union(
      v.literal("logical"),
      v.literal("emotional"),
      v.literal("aggressive"),
      v.literal("cautious"),
      v.literal("balanced"),
    ),
    demographics: v.object({
      ageRange: v.optional(
        v.union(
          v.literal("gen_z"),
          v.literal("millennial"),
          v.literal("gen_x"),
          v.literal("boomer"),
          v.literal("silent"),
        ),
      ),
      occupation: v.optional(v.string()),
      politicalLeaning: v.optional(
        v.union(
          v.literal("far_left"),
          v.literal("left"),
          v.literal("center_left"),
          v.literal("center"),
          v.literal("center_right"),
          v.literal("right"),
          v.literal("far_right"),
        ),
      ),
      education: v.optional(
        v.union(
          v.literal("high_school"),
          v.literal("some_college"),
          v.literal("bachelor"),
          v.literal("graduate"),
        ),
      ),
      religion: v.optional(v.string()),
      location: v.optional(
        v.union(
          v.literal("urban"),
          v.literal("suburban"),
          v.literal("rural"),
        ),
      ),
    }),
    isActive: v.boolean(),
    updatedAt: v.number(),
  }).index("by_active", ["isActive"]),
});

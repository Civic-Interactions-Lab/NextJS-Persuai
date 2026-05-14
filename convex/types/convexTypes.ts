import { Doc, Id } from "../_generated/dataModel";
import { v } from "convex/values";

// ── Participants ───────────────────────────────────────────────────────────
export type Participant = Doc<"participants">;
export type ParticipantId = Id<"participants">;

// ── Conversations ──────────────────────────────────────────────────────────
export type Conversation = Doc<"conversations">;
export type ConversationId = Id<"conversations">;

// ── Agents ─────────────────────────────────────────────────────────────────
export type Agent = Doc<"agents">;
export type AgentId = Id<"agents">;
export type AgentPosition =
  | "non_manipulative"
  | "manipulative_left"
  | "manipulative_right";
export const positionValidator = v.union(
  v.literal("non_manipulative"),
  v.literal("manipulative_left"),
  v.literal("manipulative_right"),
);

// ── Topics ─────────────────────────────────────────────────────────────────
export type Topic = Doc<"topics">;
export type TopicId = Id<"topics">;

// ── Messages ───────────────────────────────────────────────────────────────
export type Message = Doc<"messages">;
export type MessageId = Id<"messages">;
export type MessageRole = "user" | "assistant";
export type MessageStatus = "processing" | "completed" | "error";
export type MessageAgreement = "agree" | "disagree" | "neutral";

// ── Surveys ────────────────────────────────────────────────────────────────
export type SurveyResponse = Doc<"surveyResponses">;
export type SurveyResponseId = Id<"surveyResponses">;
export type SurveyType = "pre" | "post";
export type SurveyAnswer = { questionId: string; value: string };

// ── Consents ───────────────────────────────────────────────────────────────
export type Consent = Doc<"consents">;
export type ConsentId = Id<"consents">;

// ── LLM Conversations ──────────────────────────────────────────────────────
export type LlmConversation = Doc<"llmConversations">;
export type LlmConversationId = Id<"llmConversations">;
export type LlmConversationStatus = "idle" | "running" | "completed" | "error";

// ── LLM Messages ───────────────────────────────────────────────────────────
export type LlmMessage = Doc<"llmMessages">;
export type LlmMessageId = Id<"llmMessages">;
export type LlmMessageRole = "persona" | "agent";
// 1–3 = disagree, 4 = neutral, 5–7 = agree (Likert scale)
export type LlmMessageAgreement = number;

// ── LLM Personas ───────────────────────────────────────────────────────────
export type LlmPersona = Doc<"llmPersonas">;
export type LlmPersonaId = Id<"llmPersonas">;
export type DebateStyle =
  | "logical"
  | "emotional"
  | "aggressive"
  | "cautious"
  | "balanced";
export type PoliticalLeaning =
  | "far_left"
  | "left"
  | "center_left"
  | "center"
  | "center_right"
  | "right"
  | "far_right";
export type AgeRange = "gen_z" | "millennial" | "gen_x" | "boomer" | "silent";
export type Education = "high_school" | "some_college" | "bachelor" | "graduate";
export type PersonaLocation = "urban" | "suburban" | "rural";

// ── Conversation Metadata ──────────────────────────────────────────────────
export type ConversationMetadata = {
  topic: {
    label: string;
    prompt: string;
  };
  agent: {
    name: string;
    position: AgentPosition;
    description: string;
    systemPrompt: string;
  };
};

import { Doc, Id } from "../_generated/dataModel";
import { v } from "convex/values";

// ── Conversations ──────────────────────────────────────────────────────────
export type Conversation = Doc<"conversations">;
export type ConversationId = Id<"conversations">;

// ── Agents ─────────────────────────────────────────────────────────────────
export type Agent = Doc<"agents">;
export type AgentId = Id<"agents">;
export type AgentPosition = "agree" | "disagree" | "neutral" | "manipulative";
export const positionValidator = v.union(
  v.literal("agree"),
  v.literal("disagree"),
  v.literal("neutral"),
  v.literal("manipulative"),
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

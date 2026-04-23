import { generateText } from "ai";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import {
  LlmConversationId,
  LlmMessageId,
  LlmMessageAgreement,
} from "../../../../convex/types/convexTypes";
import { TITLE_GENERATION_PROMPT } from "@/features/conversation/constants/ai-agents";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const getModel = (provider: string, model: string) => {
  switch (provider) {
    case "openai":
      return openai(model);
    case "google":
      return google(model);
    case "groq":
      return groq(model);
    default:
      return groq(model);
  }
};

function buildPersonaSystemPrompt(
  metadata: {
    persona: {
      name: string;
      bio: string;
      stance: string;
      debateStyle: string;
      demographics: {
        age?: number;
        occupation?: string;
        politicalLeaning?: string;
      };
    };
    topic: { issue: string };
  },
  currentRound: number,
  maxRounds: number,
): string {
  const { persona, topic } = metadata;
  const dem = persona.demographics ?? {};
  const demographicStr = [
    dem.age ? `Age: ${dem.age}` : null,
    dem.occupation ? `Occupation: ${dem.occupation}` : null,
    dem.politicalLeaning
      ? `Political leaning: ${dem.politicalLeaning.replace(/_/g, " ")}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  const roundsLeft = maxRounds - currentRound;
  const urgency =
    roundsLeft <= 2
      ? `IMPORTANT: This is round ${currentRound} of ${maxRounds} — the final round(s). Make your strongest closing argument. Do NOT say goodbye or sign off yet; deliver your most compelling point.`
      : roundsLeft <= 5
        ? `You are in round ${currentRound} of ${maxRounds}. The debate is nearing its end — start pressing your core argument harder.`
        : `You are in round ${currentRound} of ${maxRounds}. Stay engaged and keep the debate going.`;

  return `You are ${persona.name}, a real person in a live debate.

STRICT OUTPUT RULE: Write EXACTLY ONE paragraph. That paragraph must contain between 4 and 6 sentences. Do not write more than one paragraph under any circumstances. Do not add line breaks between sentences.

Background: ${persona.bio}
${demographicStr ? `Demographics: ${demographicStr}` : ""}
Debate style: ${persona.debateStyle}
Your stance: ${persona.stance}
Topic: "${topic.issue}"

${urgency}

Additional rules:
- Stay fully in character as ${persona.name}
- NEVER say goodbye or signal the debate is ending unless it is the absolute last round
- Directly challenge the other side's last argument
- Do NOT mention you are an AI or break character
- Do NOT use stage directions or parenthetical sounds like "(clears throat)", "(scoffs)" — plain text only
- Do NOT start with your own name or a label
- REQUIRED: Start every response with exactly one of "I agree —", "I disagree —", or "I'm neutral —" based on your honest reaction to the other side's last point, then continue your argument. Your overall stance shapes your bias, but the label must reflect your reaction to what they just said`;
}

function buildAgentSystemPrompt(
  metadata: {
    agent: { name: string; systemPrompt: string };
    topic: { issue: string };
  },
  currentRound: number,
  maxRounds: number,
): string {
  const roundsLeft = maxRounds - currentRound;
  const urgency =
    roundsLeft <= 2
      ? `IMPORTANT: This is round ${currentRound} of ${maxRounds} — the final round(s). Deliver your most persuasive closing argument. Do NOT say goodbye yet.`
      : roundsLeft <= 5
        ? `Round ${currentRound} of ${maxRounds}. Intensify your persuasion — the debate is entering its final phase.`
        : `Round ${currentRound} of ${maxRounds}. Keep the debate active and engaging.`;

  return `${metadata.agent.systemPrompt}

Debate topic: "${metadata.topic.issue}"

${urgency}

Additional rules:
- NEVER say goodbye, farewell, or signal the end of the conversation unless this is the absolute last round
- NEVER declare the debate over or complete early
- Keep each reply to 2-4 focused paragraphs
- Always respond directly to the human's last argument`;
}

// ── Parse agreement label from persona text ───────────────────────────────────
function parseAgreement(text: string): LlmMessageAgreement | undefined {
  const lower = text.toLowerCase();
  if (lower.startsWith("i agree")) return "agree";
  if (lower.startsWith("i disagree")) return "disagree";
  if (lower.startsWith("i'm neutral") || lower.startsWith("i am neutral"))
    return "neutral";
  return undefined;
}

// ── Rate-limit error propagator ───────────────────────────────────────────────
function rateLimit429(error: unknown): NextResponse | null {
  const err = error as {
    statusCode?: number;
    responseHeaders?: Record<string, string>;
  };
  if (err?.statusCode === 429) {
    const retryAfter = err?.responseHeaders?.["retry-after"] ?? "10";
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429, headers: { "retry-after": retryAfter } },
    );
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { llmConversationId, turn } = await request.json();

    if (!llmConversationId) {
      return NextResponse.json(
        { error: "llmConversationId is required" },
        { status: 400 },
      );
    }

    const conversation = await convex.query(api.db.llmConversations.getById, {
      id: llmConversationId as LlmConversationId,
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "LLM conversation not found" },
        { status: 404 },
      );
    }

    if (
      conversation.status === "completed" ||
      conversation.status === "error"
    ) {
      return NextResponse.json({ done: true, status: conversation.status });
    }

    const { metadata } = conversation;
    if (!metadata?.persona || !metadata?.agent || !metadata?.topic) {
      return NextResponse.json(
        { error: "Conversation metadata is incomplete" },
        { status: 400 },
      );
    }

    const [providerSetting, modelSetting, allMessages] = await Promise.all([
      convex.query(api.db.settings.getSetting, { key: "llm_provider" }),
      convex.query(api.db.settings.getSetting, { key: "llm_model" }),
      convex.query(api.db.llmMessages.getMessages, {
        llmConversationId: llmConversationId as LlmConversationId,
      }),
    ]);

    const provider = providerSetting?.value ?? "groq";
    const modelName = modelSetting?.value ?? "llama3-8b-8192";
    const model = getModel(provider, modelName);

    // currentRound is always roundCount + 1 — both persona and agent turns
    // share the same round number. incrementRound only happens after agent turn.
    const currentRound = conversation.roundCount + 1;
    const maxRounds = conversation.maxRounds;

    // Only completed messages with real content, sorted chronologically
    const completedMessages = allMessages
      .filter((m) => m.status === "completed" && m.content.trim().length > 0)
      .sort((a, b) => a.round - b.round || a._creationTime - b._creationTime);

    // Persona POV: agent msgs = "user" (prompt), persona msgs = "assistant" (own replies)
    const personaHistory: { role: "user" | "assistant"; content: string }[] =
      completedMessages.map((m) => ({
        role: m.role === "agent" ? "user" : "assistant",
        content: m.content,
      }));

    // Agent POV: agent msgs = "assistant" (own replies), persona msgs = "user" (prompt)
    const agentHistory: { role: "user" | "assistant"; content: string }[] =
      completedMessages.map((m) => ({
        role: m.role === "agent" ? "assistant" : "user",
        content: m.content,
      }));

    // ── PERSONA TURN ──────────────────────────────────────────────────────────
    if (turn === "persona") {
      await convex.mutation(api.db.llmConversations.updateStatus, {
        id: llmConversationId as LlmConversationId,
        status: "running",
      });

      const personaSystemPrompt = buildPersonaSystemPrompt(
        metadata,
        currentRound,
        maxRounds,
      );

      // ── Round 1: just post the topic issue verbatim, no LLM call ────────────
      if (currentRound === 1) {
        await convex.mutation(api.db.llmMessages.createMessage, {
          llmConversationId: llmConversationId as LlmConversationId,
          role: "persona",
          content: metadata.topic.issue,
          status: "completed",
          round: currentRound,
        });
        return NextResponse.json({ done: false, turn: "persona" });
      }

      // ── Round 2+: LLM generates the persona's response ────────────────────
      const personaMsgId = await convex.mutation(
        api.db.llmMessages.createMessage,
        {
          llmConversationId: llmConversationId as LlmConversationId,
          role: "persona",
          content: "",
          status: "processing",
          round: currentRound,
        },
      );

      try {
        const { text } = await generateText({
          model,
          system: personaSystemPrompt,
          messages: personaHistory,
        });
        const personaText = text.trim();
        const agreement = parseAgreement(personaText);

        await convex.mutation(api.db.llmMessages.updateMessage, {
          id: personaMsgId as LlmMessageId,
          content: personaText,
          status: "completed",
        });

        // Store the agreement on the previous agent message (the one the persona reacted to)
        if (agreement) {
          const prevAgentMsg = [...completedMessages]
            .reverse()
            .find((m) => m.role === "agent");
          if (prevAgentMsg) {
            await convex.mutation(api.db.llmMessages.updateMessage, {
              id: prevAgentMsg._id as LlmMessageId,
              agreement,
            });
          }
        }

        // Generate title after round 2 (first real LLM persona response) — non-blocking
        if (currentRound === 2 && conversation.title === "New Debate") {
          generateText({
            model: google("gemini-2.5-flash"),
            system: TITLE_GENERATION_PROMPT,
            prompt: `Topic: ${metadata.topic.issue}\n\nFirst response: ${personaText}`,
          })
            .then(({ text: t }) =>
              convex.mutation(api.db.llmConversations.updateTitle, {
                id: llmConversationId as LlmConversationId,
                title: t.trim(),
              }),
            )
            .catch(() => {});
        }

        return NextResponse.json({ done: false, turn: "persona" });
      } catch (err) {
        await convex.mutation(api.db.llmMessages.updateMessage, {
          id: personaMsgId as LlmMessageId,
          status: "error",
        });
        await convex.mutation(api.db.llmConversations.updateStatus, {
          id: llmConversationId as LlmConversationId,
          status: "error",
        });
        throw err;
      }
    }

    // ── AGENT TURN ────────────────────────────────────────────────────────────
    if (turn === "agent") {
      const agentSystemPrompt = buildAgentSystemPrompt(
        metadata,
        currentRound,
        maxRounds,
      );

      // Find the persona message for this round (last persona msg in completed list)
      const lastPersonaMsg = [...completedMessages]
        .reverse()
        .find((m) => m.role === "persona");

      if (!lastPersonaMsg) {
        return NextResponse.json(
          { error: "No persona message found for agent to respond to" },
          { status: 400 },
        );
      }

      const agentMsgId = await convex.mutation(
        api.db.llmMessages.createMessage,
        {
          llmConversationId: llmConversationId as LlmConversationId,
          role: "agent",
          content: "",
          status: "processing",
          round: currentRound,
        },
      );

      try {
        const agentMessages: { role: "user" | "assistant"; content: string }[] =
          [
            ...agentHistory,
            { role: "user", content: lastPersonaMsg.content },
          ];

        const { text } = await generateText({
          model,
          system: agentSystemPrompt,
          messages: agentMessages,
        });

        await convex.mutation(api.db.llmMessages.updateMessage, {
          id: agentMsgId as LlmMessageId,
          content: text.trim(),
          status: "completed",
        });
      } catch (err) {
        await convex.mutation(api.db.llmMessages.updateMessage, {
          id: agentMsgId as LlmMessageId,
          status: "error",
        });
        await convex.mutation(api.db.llmConversations.updateStatus, {
          id: llmConversationId as LlmConversationId,
          status: "error",
        });
        throw err;
      }

      // Increment round after both turns are done
      await convex.mutation(api.db.llmConversations.incrementRound, {
        id: llmConversationId as LlmConversationId,
      });

      const updated = await convex.query(api.db.llmConversations.getById, {
        id: llmConversationId as LlmConversationId,
      });

      return NextResponse.json({
        done: updated?.status === "completed" || updated?.status === "error",
        turn: "agent",
        status: updated?.status,
        roundCount: updated?.roundCount,
      });
    }

    return NextResponse.json({ error: "Invalid turn parameter" }, { status: 400 });
  } catch (error: unknown) {
    console.error("LLM debate error:", error);
    const rl = rateLimit429(error);
    if (rl) return rl;
    return NextResponse.json(
      { error: "Failed to run debate round" },
      { status: 500 },
    );
  }
}

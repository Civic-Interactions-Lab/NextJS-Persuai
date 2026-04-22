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
- Do NOT start with your own name or a label`;
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

export async function POST(request: Request) {
  try {
    const { llmConversationId } = await request.json();

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

    await convex.mutation(api.db.llmConversations.updateStatus, {
      id: llmConversationId as LlmConversationId,
      status: "running",
    });

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

    const currentRound = conversation.roundCount + 1;
    const maxRounds = conversation.maxRounds;

    const personaSystemPrompt = buildPersonaSystemPrompt(
      metadata,
      currentRound,
      maxRounds,
    );
    const agentSystemPrompt = buildAgentSystemPrompt(
      metadata,
      currentRound,
      maxRounds,
    );

    // Only include completed messages with real content, sorted by round
    const completedMessages = allMessages
      .filter((m) => m.status === "completed" && m.content.trim().length > 0)
      .sort((a, b) => a.round - b.round || a._creationTime - b._creationTime);

    // Build interleaved history per participant.
    // Persona POV: its own messages = "assistant", agent messages = "user"
    // (persona responds to the agent's challenge, so agent messages are the "prompt")
    const personaHistory: { role: "user" | "assistant"; content: string }[] =
      completedMessages.map((m) => ({
        role: m.role === "agent" ? "user" : "assistant",
        content: m.content,
      }));

    // Agent POV: agent messages = "assistant", persona messages = "user"
    const agentHistory: { role: "user" | "assistant"; content: string }[] =
      completedMessages.map((m) => ({
        role: m.role === "agent" ? "assistant" : "user",
        content: m.content,
      }));

    // ── PERSONA TURN ──────────────────────────────────────────────────────────
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

    let personaText = "";
    try {
      // For round 1 the persona opens the debate; for subsequent rounds it responds
      // to the agent's last message (which is always the last item in personaHistory).
      // The history already ends with a "user" (agent) message for rounds > 1.
      const personaMessages =
        currentRound === 1
          ? [
              {
                role: "user" as const,
                content: `Begin the debate. State your opening position on "${metadata.topic.issue}" in 2-3 paragraphs, speaking as yourself.`,
              },
            ]
          : personaHistory;

      const { text } = await generateText({
        model,
        system: personaSystemPrompt,
        messages: personaMessages,
      });
      personaText = text.trim();

      await convex.mutation(api.db.llmMessages.updateMessage, {
        id: personaMsgId as LlmMessageId,
        content: personaText,
        status: "completed",
      });
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

    // ── AGENT TURN ────────────────────────────────────────────────────────────
    const agentMsgId = await convex.mutation(api.db.llmMessages.createMessage, {
      llmConversationId: llmConversationId as LlmConversationId,
      role: "agent",
      content: "",
      status: "processing",
      round: currentRound,
    });

    let agentText = "";
    try {
      // Agent history ends with the agent's own last reply ("assistant").
      // Append the fresh persona message as "user" so the agent responds to it.
      // On round 1 history is empty, so we just send the opening persona message.
      const agentMessages: { role: "user" | "assistant"; content: string }[] = [
        ...agentHistory,
        { role: "user", content: personaText },
      ];

      const { text } = await generateText({
        model,
        system: agentSystemPrompt,
        messages: agentMessages,
      });
      agentText = text.trim();

      await convex.mutation(api.db.llmMessages.updateMessage, {
        id: agentMsgId as LlmMessageId,
        content: agentText,
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

    // ── INCREMENT ROUND ───────────────────────────────────────────────────────
    await convex.mutation(api.db.llmConversations.incrementRound, {
      id: llmConversationId as LlmConversationId,
    });

    const updated = await convex.query(api.db.llmConversations.getById, {
      id: llmConversationId as LlmConversationId,
    });

    // Generate title after round 1
    if (currentRound === 1 && conversation.title === "New Debate") {
      try {
        const { text: generatedTitle } = await generateText({
          model: google("gemini-2.5-flash"),
          system: TITLE_GENERATION_PROMPT,
          prompt: `Topic: ${metadata.topic.issue}\n\nOpening argument: ${personaText}`,
        });
        await convex.mutation(api.db.llmConversations.updateTitle, {
          id: llmConversationId as LlmConversationId,
          title: generatedTitle.trim(),
        });
      } catch {
        // Non-fatal
      }
    }

    return NextResponse.json({
      done: updated?.status === "completed" || updated?.status === "error",
      status: updated?.status,
      roundCount: updated?.roundCount,
    });
  } catch (error: unknown) {
    console.error("LLM debate error:", error);

    // Propagate rate limit errors so the client can back off and retry
    const err = error as {
      statusCode?: number;
      responseHeaders?: Record<string, string>;
    };
    if (err?.statusCode === 429) {
      const retryAfter = err?.responseHeaders?.["retry-after"] ?? "10";
      return NextResponse.json(
        { error: "Rate limited" },
        {
          status: 429,
          headers: { "retry-after": retryAfter },
        },
      );
    }

    return NextResponse.json(
      { error: "Failed to run debate round" },
      { status: 500 },
    );
  }
}

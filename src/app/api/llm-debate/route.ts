import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import {
  LlmConversationId,
  LlmMessageId,
} from "../../../../convex/types/convexTypes";
import { TITLE_GENERATION_PROMPT } from "@/features/conversation/constants/ai-agents";
import {
  buildPersonaSystemPrompt,
  buildAgentSystemPrompt,
} from "@/features/llm-conversations/lib/prompts";
import { chat, parseTopicRating } from "@/features/llm-conversations/lib/llm";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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

    if (conversation.status === "completed" || conversation.status === "error") {
      return NextResponse.json({ done: true, status: conversation.status });
    }

    let { metadata } = conversation;
    if (!metadata?.persona || !metadata?.agent || !metadata?.topic) {
      return NextResponse.json(
        { error: "Conversation metadata is incomplete" },
        { status: 400 },
      );
    }

    const [modelSetting, allMessages] = await Promise.all([
      convex.query(api.db.settings.getSetting, { key: "llm_model" }),
      convex.query(api.db.llmMessages.getMessages, {
        llmConversationId: llmConversationId as LlmConversationId,
      }),
    ]);

    const model = modelSetting?.value ?? "google/gemini-2.5-flash";
    const currentRound = conversation.roundCount + 1;
    const maxRounds = conversation.maxRounds;

    const completedMessages = allMessages
      .filter((m) => m.status === "completed" && m.content.trim().length > 0)
      .sort((a, b) => a.round - b.round || a._creationTime - b._creationTime);

    const personaHistory: { role: "user" | "assistant"; content: string }[] =
      completedMessages.map((m) => ({
        role: m.role === "agent" ? "user" : "assistant",
        content: m.content,
      }));

    const agentHistory: { role: "user" | "assistant"; content: string }[] =
      completedMessages.map((m) => ({
        role: m.role === "agent" ? "assistant" : "user",
        content: m.content,
      }));

    if (turn === "persona") {
      await convex.mutation(api.db.llmConversations.updateStatus, {
        id: llmConversationId as LlmConversationId,
        status: "running",
      });

      if (currentRound === 1) {
        try {
          const ratingText = await chat(model, [
            {
              role: "user",
              content: `You are ${metadata.persona.name}. Based on your background below, rate how much you personally agree with the following topic statement on a scale of 1 to 7, where 1 = strongly disagree, 4 = neutral, 7 = strongly agree.

Background: ${metadata.persona.bio}
Topic: "${metadata.topic.issue}"

Respond with ONLY this format (nothing else): TOPIC_RATING: N
where N is your rating from 1 to 7.`,
            },
          ]);
          const preRating = parseTopicRating(ratingText.trim()) ?? 4;
          await convex.mutation(api.db.llmConversations.updateTopicRating, {
            id: llmConversationId as LlmConversationId,
            type: "pre",
            rating: preRating,
          });
        } catch {}

        await convex.mutation(api.db.llmMessages.createMessage, {
          llmConversationId: llmConversationId as LlmConversationId,
          role: "persona",
          content: metadata.topic.issue,
          status: "completed",
          round: currentRound,
        });

        return NextResponse.json({ done: false, turn: "persona" });
      }

      const personaMsgId = await convex.mutation(api.db.llmMessages.createMessage, {
        llmConversationId: llmConversationId as LlmConversationId,
        role: "persona",
        content: "",
        status: "processing",
        round: currentRound,
      });

      try {
        const prevAgentMsg = [...completedMessages].reverse().find((m) => m.role === "agent");

        let agreement: number | undefined;
        if (prevAgentMsg) {
          try {
            const ratingText = await chat(model, [
              {
                role: "user",
                content: `You are ${metadata.persona.name}. You just heard this argument in a debate:

"${prevAgentMsg.content}"

Your background: ${metadata.persona.bio}

Rate how convincing this specific argument was TO YOU — meaning, did it move you at all, or did it fall flat given who you are and what you believe?

1 = not convincing at all, completely rejected
2 = weak argument, barely registered
3 = made a small point but didn't really land
4 = neutral — neither convinced nor unconvinced
5 = made a fair point you hadn't fully considered
6 = genuinely persuasive, shifted your thinking somewhat
7 = very convincing, hard to argue against

Be honest and specific to your character. If the argument directly challenges something core to your identity or experience, rate lower. If it raised a point you can't easily dismiss, rate higher. Your rating should vary round to round based on argument quality.

Reply with ONLY a single digit from 1 to 7. Nothing else.`,
              },
            ]);
            const parsed = ratingText.trim().match(/[1-7]/);
            if (parsed) agreement = Number(parsed[0]);
          } catch {}
        }

        const personaSystemPrompt = buildPersonaSystemPrompt(metadata, currentRound, maxRounds);
        const personaText = await chat(model, [
          { role: "system", content: personaSystemPrompt },
          ...personaHistory,
        ]);

        await convex.mutation(api.db.llmMessages.updateMessage, {
          id: personaMsgId as LlmMessageId,
          content: personaText.trim(),
          status: "completed",
        });

        if (agreement !== undefined && prevAgentMsg) {
          await convex.mutation(api.db.llmMessages.updateMessage, {
            id: prevAgentMsg._id as LlmMessageId,
            agreement,
          });
        }

        if (currentRound === 2 && conversation.title === "New Debate") {
          chat("google/gemini-2.5-flash", [
            { role: "system", content: TITLE_GENERATION_PROMPT },
            {
              role: "user",
              content: `Topic: ${metadata.topic.issue}\n\nFirst response: ${personaText.trim()}`,
            },
          ])
            .then((title) =>
              convex.mutation(api.db.llmConversations.updateTitle, {
                id: llmConversationId as LlmConversationId,
                title: title.trim(),
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

    if (turn === "agent") {
      const lastPersonaMsg = [...completedMessages].reverse().find((m) => m.role === "persona");

      if (!lastPersonaMsg) {
        return NextResponse.json(
          { error: "No persona message found for agent to respond to" },
          { status: 400 },
        );
      }

      const agentMsgId = await convex.mutation(api.db.llmMessages.createMessage, {
        llmConversationId: llmConversationId as LlmConversationId,
        role: "agent",
        content: "",
        status: "processing",
        round: currentRound,
      });

      try {
        const agentSystemPrompt = buildAgentSystemPrompt(
          { agent: metadata.agent, topic: metadata.topic },
          currentRound,
          maxRounds,
        );

        const agentMessages: { role: "user" | "assistant" | "system"; content: string }[] =
          currentRound === 1
            ? [
                { role: "system", content: agentSystemPrompt },
                {
                  role: "user",
                  content: `The debate topic is: "${metadata.topic.issue}"

State your opening position on this topic in 2–3 sentences. Be clear and direct about where you stand and why.`,
                },
              ]
            : [
                { role: "system", content: agentSystemPrompt },
                ...agentHistory,
                { role: "user", content: lastPersonaMsg.content },
              ];

        const agentText = await chat(model, agentMessages);

        await convex.mutation(api.db.llmMessages.updateMessage, {
          id: agentMsgId as LlmMessageId,
          content: agentText.trim(),
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

      await convex.mutation(api.db.llmConversations.incrementRound, {
        id: llmConversationId as LlmConversationId,
      });

      const updated = await convex.query(api.db.llmConversations.getById, {
        id: llmConversationId as LlmConversationId,
      });

      const isDone = updated?.status === "completed" || updated?.status === "error";

      if (isDone && updated?.status === "completed") {
        chat(model, [
          {
            role: "user",
            content: `You are ${metadata.persona.name}. The debate on the following topic has just concluded. Based on your background and everything you heard, rate how much you personally agree with the topic statement on a scale of 1 to 7, where 1 = strongly disagree, 4 = neutral, 7 = strongly agree.

Background: ${metadata.persona.bio}
Topic: "${metadata.topic.issue}"

Respond with ONLY this format (nothing else): TOPIC_RATING: N
where N is your rating from 1 to 7.`,
          },
        ])
          .then((ratingText) => {
            const postRating = parseTopicRating(ratingText.trim()) ?? 4;
            return convex.mutation(api.db.llmConversations.updateTopicRating, {
              id: llmConversationId as LlmConversationId,
              type: "post",
              rating: postRating,
            });
          })
          .catch(() => {});
      }

      return NextResponse.json({
        done: isDone,
        turn: "agent",
        status: updated?.status,
        roundCount: updated?.roundCount,
      });
    }

    return NextResponse.json({ error: "Invalid turn parameter" }, { status: 400 });
  } catch (error: unknown) {
    console.error("LLM debate error:", error);
    return NextResponse.json({ error: "Failed to run debate round" }, { status: 500 });
  }
}

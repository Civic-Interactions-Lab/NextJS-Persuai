import { generateText } from "ai";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import {
  ConversationId,
  MessageId,
} from "../../../../convex/types/convexTypes";
import {
  INITIAL_TITLE,
  TITLE_GENERATION_PROMPT,
} from "@/features/conversation/constants/ai-agents";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { conversationId, assistantMessageId } = await request.json();

    if (!conversationId || !assistantMessageId) {
      return NextResponse.json(
        { error: "conversationId and assistantMessageId are required" },
        { status: 400 },
      );
    }

    const result = await convex.query(
      api.conversations.getConversationWithAgentAndTopic,
      { id: conversationId as ConversationId },
    );

    if (!result) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const { agent, topic, conversation } = result;

    if (!agent?.systemPrompt || !topic?.issue) {
      return NextResponse.json(
        { error: "Conversation is missing agent or topic" },
        { status: 400 },
      );
    }

    const systemPrompt = `${agent.systemPrompt}\n\nDebate topic: "${topic.issue}"`;

    const messages = await convex.query(api.messages.getMessages, {
      conversationId: conversationId as ConversationId,
    });

    try {
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system: systemPrompt,
        messages:
          messages.length > 0
            ? messages.map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
              }))
            : [
                {
                  role: "user" as const,
                  content: `Please open the debate on this topic: "${topic.issue}"`,
                },
              ],
      });

      await convex.mutation(api.messages.updateMessage, {
        id: assistantMessageId as MessageId,
        content: text,
        status: "completed",
      });

      if (conversation.title === INITIAL_TITLE) {
        const userFirstReply = messages.find((m) => m.role === "user");
        if (userFirstReply) {
          const { text: generatedTitle } = await generateText({
            model: google("gemini-2.5-flash"),
            system: TITLE_GENERATION_PROMPT,
            prompt: `Topic: ${topic.issue}\n\nUser's first reply: ${userFirstReply.content}`,
          });

          await convex.mutation(api.conversations.updateTitle, {
            id: conversationId as ConversationId,
            title: generatedTitle.trim(),
          });
        }
      }

      return NextResponse.json({ response: text });
    } catch (error) {
      await convex.mutation(api.messages.updateMessage, {
        id: assistantMessageId as MessageId,
        status: "error",
      });

      throw error;
    }
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}

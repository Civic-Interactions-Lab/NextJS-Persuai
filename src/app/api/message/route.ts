import { generateText } from "ai";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import {
  ConversationId,
  MessageId,
} from "../../../../convex/types/convexTypes";
import { TITLE_GENERATION_PROMPT } from "@/features/conversation/constants/ai-prompts";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  try {
    const { conversationId, assistantMessageId, message } =
      await request.json();

    if (!conversationId || !assistantMessageId || !message) {
      return NextResponse.json(
        {
          error: "conversationId, assistantMessageId, and message are required",
        },
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

    const { agent, topic } = result;

    if (!agent?.systemPrompt || !topic?.context) {
      return NextResponse.json(
        { error: "Conversation is missing agent or topic" },
        { status: 400 },
      );
    }

    const systemPrompt = `${agent.systemPrompt}\n\nTopic context: "${topic.context}"`;

    const messages = await convex.query(api.messages.getMessages, {
      conversationId: conversationId as ConversationId,
    });

    try {
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system: systemPrompt,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      await convex.mutation(api.messages.updateMessage, {
        id: assistantMessageId as MessageId,
        content: text,
        status: "completed",
      });

      if (messages.length === 2) {
        const { text: generatedTitle } = await generateText({
          model: google("gemini-2.5-flash"),
          system: TITLE_GENERATION_PROMPT,
          prompt: `Topic: ${topic.issue}\n\nUser's opening statement: ${message}`,
        });

        await convex.mutation(api.conversations.updateTitle, {
          id: conversationId as ConversationId,
          title: generatedTitle.trim(),
        });
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

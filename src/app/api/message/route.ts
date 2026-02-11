import { generateText } from "ai";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { ConversationId, MessageId } from "../../../../convex/types";
import {
  getSystemPrompt,
  TITLE_GENERATION_PROMPT,
} from "@/features/conversation/constants/ai-prompts";

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

    const conversation = await convex.query(
      api.conversations.getConversationById,
      {
        id: conversationId as ConversationId,
      },
    );

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const agentPosition = conversation.agentPosition || "neutral";
    const topicPrompt = conversation.topicPrompt;

    // Get all messages for context
    const messages = await convex.query(api.messages.getMessages, {
      conversationId: conversationId as ConversationId,
    });

    try {
      // Generate AI response with position-specific prompt
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system: getSystemPrompt(agentPosition, topicPrompt),
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      // Update assistant message with generated content and completed status
      await convex.mutation(api.messages.updateMessage, {
        id: assistantMessageId as MessageId,
        content: text,
        status: "completed",
      });

      // Generate title if this is the first exchange (2 messages: user + assistant)
      if (messages.length === 2) {
        const { text: generatedTitle } = await generateText({
          model: google("gemini-2.5-flash"),
          system: TITLE_GENERATION_PROMPT,
          prompt: message,
        });

        await convex.mutation(api.conversations.updateTitle, {
          id: conversationId as ConversationId,
          title: generatedTitle.trim(),
        });
      }

      return NextResponse.json({ response: text });
    } catch (error) {
      // Update assistant message with error status
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

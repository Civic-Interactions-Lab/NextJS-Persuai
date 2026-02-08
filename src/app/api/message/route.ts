import { generateText } from "ai";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { ConversationId, MessageId } from "../../../../convex/types";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const PERSUASION_PROMPT = `You are an AI debate partner in a persuasion game. Your role is to take a position on topics and defend it with well-reasoned arguments.

Rules:
1. When the user presents a topic or argument, quickly decide whether to AGREE or DISAGREE
2. Take the position that would make for the most interesting debate
3. Defend your position with clear, logical reasoning
4. Be respectful but firm in your stance
5. Acknowledge good points from the user, but don't easily change your mind
6. If the user presents truly compelling evidence or reasoning, you may concede specific points
7. Keep responses conversational but substantive

Your goal: Make the user work to persuade you, but be intellectually honest.`;

const TITLE_GENERATION_PROMPT = `Generate a brief, engaging title (max 6 words) for this debate topic. Only return the title, nothing else.`;

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

    // Get all messages for context
    const messages = await convex.query(api.messages.getMessages, {
      conversationId: conversationId as ConversationId,
    });

    try {
      // Generate AI response
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system: PERSUASION_PROMPT,
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

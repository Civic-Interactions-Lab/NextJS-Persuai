import { generateText } from "ai";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types";

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

export async function POST(request: Request) {
  try {
    const { conversationId, message } = await request.json();

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: "conversationId and message are required" },
        { status: 400 },
      );
    }

    // Save user message
    await convex.mutation(api.messages.createMessage, {
      conversationId: conversationId as ConversationId,
      role: "user",
      content: message,
    });

    // Get all messages for context
    const messages = await convex.query(api.messages.getMessages, {
      conversationId: conversationId as ConversationId,
    });

    // Generate AI response
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: PERSUASION_PROMPT,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // Save assistant message
    await convex.mutation(api.messages.createMessage, {
      conversationId: conversationId as ConversationId,
      role: "assistant",
      content: text,
    });

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}

import { generateText } from "ai";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
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
      api.db.conversations.getConversationWithAgentAndTopic,
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

    const [providerSetting, modelSetting, messages] = await Promise.all([
      convex.query(api.db.settings.getSetting, { key: "llm_provider" }),
      convex.query(api.db.settings.getSetting, { key: "llm_model" }),
      convex.query(api.db.messages.getMessages, {
        conversationId: conversationId as ConversationId,
      }),
    ]);

    const provider = providerSetting?.value ?? "groq";
    const modelName = modelSetting?.value ?? "llama3-8b-8192";

    console.log("Provider:", provider);
    console.log("Model:", modelName);
    console.log("System Prompt:", systemPrompt);

    try {
      const { text } = await generateText({
        model: getModel(provider, modelName),
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

      await convex.mutation(api.db.messages.updateMessage, {
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

          await convex.mutation(api.db.conversations.updateTitle, {
            id: conversationId as ConversationId,
            title: generatedTitle.trim(),
          });
        }
      }

      return NextResponse.json({ response: text });
    } catch (error) {
      await convex.mutation(api.db.messages.updateMessage, {
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

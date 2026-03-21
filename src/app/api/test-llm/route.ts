import { generateText } from "ai";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";

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
    const { provider, model, messages, systemPrompt } = await request.json();
    const { text } = await generateText({
      model: getModel(provider, model),
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages,
    });
    return NextResponse.json({ text });
  } catch (error) {
    console.error("Test LLM error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}

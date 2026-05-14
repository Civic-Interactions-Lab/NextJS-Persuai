import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function chat(
  model: string,
  messages: { role: "user" | "assistant" | "system"; content: string }[],
): Promise<string> {
  const completion = await client.chat.send({
    chatRequest: { model, messages },
  });
  const result = completion as { choices: { message: { content: string } }[] };
  return result.choices[0].message.content ?? "";
}

export function parseTopicRating(text: string): number | undefined {
  const match = text.match(/TOPIC_RATING:\s*([1-7])/i);
  if (match) return Number(match[1]);
  return undefined;
}

import { cookies } from "next/headers";

export async function checkLlmAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("llm-token")?.value;

  if (!process.env.LLM_TOKEN || !token) return false;

  return token === process.env.LLM_TOKEN;
}

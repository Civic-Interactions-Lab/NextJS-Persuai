import { redirect } from "next/navigation";
import { checkLlmAuth } from "@/features/llm-conversations/lib/check-auth";
import LlmLoginView from "@/features/llm-conversations/views/llm-login-view";

export default async function LlmLoginPage() {
  const isAuthenticated = await checkLlmAuth();

  if (isAuthenticated) {
    redirect("/llm-conversations");
  }

  return <LlmLoginView />;
}

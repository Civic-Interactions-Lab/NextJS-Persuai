import { redirect } from "next/navigation";
import { checkLlmAuth } from "@/features/llm-conversations/lib/check-auth";
import LlmLayout from "@/features/llm-conversations/components/llm-layout";

export default async function LlmProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkLlmAuth();

  if (!isAuthenticated) {
    redirect("/llm-login");
  }

  return <LlmLayout>{children}</LlmLayout>;
}

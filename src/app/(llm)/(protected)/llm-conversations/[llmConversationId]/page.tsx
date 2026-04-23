import { redirect } from "next/navigation";
import { isValidConvexId } from "../../../../../../convex/utils";
import { LlmConversationId } from "../../../../../../convex/types/convexTypes";
import LlmConversationView from "@/features/llm-conversations/views/llm-conversation-view";

export default async function LlmConversationPage({
  params,
}: {
  params: Promise<{ llmConversationId: string }>;
}) {
  const { llmConversationId } = await params;

  if (!isValidConvexId(llmConversationId)) {
    redirect("/llm-conversations");
  }

  return (
    <LlmConversationView
      conversationId={llmConversationId as LlmConversationId}
    />
  );
}

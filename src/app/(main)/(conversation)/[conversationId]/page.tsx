import React from "react";
import ConversationView from "@/features/conversation/views/conversation-view";
import { ConversationId } from "../../../../../convex/types";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return <ConversationView conversationId={conversationId as ConversationId} />;
}

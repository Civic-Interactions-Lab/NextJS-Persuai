import React from "react";
import ConversationView from "@/features/conversation/views/conversation-view";
import { ConversationId } from "../../../../../convex/types/convexTypes";
import { redirect } from "next/navigation";
import { isValidConvexId } from "../../../../../convex/utils";

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ stance?: string }>;
}) {
  const { conversationId } = await params;
  const { stance } = await searchParams;

  if (!isValidConvexId(conversationId)) {
    redirect("/");
  }

  return (
    <ConversationView
      conversationId={conversationId as ConversationId}
      topicStance={stance}
    />
  );
}

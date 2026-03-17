import React from "react";
import NewConversationView from "@/features/conversation/views/new-conversation-view";

export default async function NewConversation({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  return (
    <NewConversationView
      prolificPid={params.PROLIFIC_PID}
      studyId={params.STUDY_ID}
      sessionId={params.SESSION_ID}
    />
  );
}

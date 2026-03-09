import React, { Suspense } from "react";
import NewConversationView from "@/features/conversation/views/new-conversation-view";
import { LoaderIcon } from "lucide-react";

export default function NewConversation() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NewConversationView />
    </Suspense>
  );
}

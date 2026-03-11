"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetConversationById } from "@/features/conversation/hooks/use-conversations";
import { usePathname } from "next/navigation";
import { ConversationId } from "../../../../convex/types/convexTypes";
import { isValidConvexId } from "../../../../convex/utils";
import FinishStudyButton from "@/features/conversation/components/finish-study-button";

const ConversationHeader = () => {
  const pathname = usePathname();

  let conversationId: ConversationId | null = null;
  if (pathname.startsWith("/conversations/")) {
    const id = pathname.replace("/conversations/", "");
    if (isValidConvexId(id)) {
      conversationId = id as ConversationId;
    }
  }

  const conversation = useGetConversationById(conversationId);

  let title = "";
  if (pathname === "/survey") {
    title = "Getting Started";
  } else if (pathname === "/debriefing") {
    title = "Study Completion";
  } else if (conversation) {
    title = conversation.title;
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 overflow-hidden w-full">
      <SidebarTrigger />
      <div className="flex-1 min-w-0 mr-6">
        {title && <h1 className="font-medium text-sm truncate">{title}</h1>}
      </div>

      {conversationId && title && (
        <FinishStudyButton conversationId={conversationId} />
      )}
    </header>
  );
};

export default ConversationHeader;

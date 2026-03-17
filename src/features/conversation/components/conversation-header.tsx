"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetConversationById } from "@/features/conversation/hooks/use-conversations";
import { usePathname, useSearchParams } from "next/navigation";
import { ConversationId } from "../../../../convex/types/convexTypes";
import { isValidConvexId } from "../../../../convex/utils";
import StudyFinishButton from "@/features/conversation/components/study-finish-button";
import StudyExitButton from "@/features/conversation/components/study-exit-button";

const ConversationHeader = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  let conversationId: ConversationId | null = null;
  if (pathname.startsWith("/conversations/")) {
    const id = pathname.replace("/conversations/", "");
    if (isValidConvexId(id)) {
      conversationId = id as ConversationId;
    }
  }

  const conversation = useGetConversationById(conversationId);
  const isSurvey = pathname === "/survey";
  const isPreSurvey = isSurvey && searchParams.get("type") === "pre";

  let title = "";
  if (isSurvey) {
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

      {isPreSurvey && <StudyExitButton />}

      {conversationId && title && (
        <StudyFinishButton conversationId={conversationId} />
      )}
    </header>
  );
};

export default ConversationHeader;

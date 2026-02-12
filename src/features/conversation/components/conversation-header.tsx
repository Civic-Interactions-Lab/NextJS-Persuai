"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetConversationById } from "@/features/conversation/hooks/use-conversations";
import { usePathname } from "next/navigation";
import { ConversationId } from "../../../../convex/types";
import { isValidConvexId } from "../../../../convex/utils";

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
  } else if (conversation) {
    title = conversation.title;
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />
      <div className="flex-1">
        {title && <h1 className="font-medium text-sm truncate">{title}</h1>}
      </div>
    </header>
  );
};

export default ConversationHeader;

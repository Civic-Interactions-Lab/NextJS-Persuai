"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useGetConversationById } from "@/features/conversation/hooks/use-conversations";
import { ConversationId } from "../../../../convex/types";

const isValidConvexId = (str: string): boolean => {
  return /^[a-z0-9]{20,}$/.test(str);
};

const ConversationHeader = () => {
  const pathname = usePathname();

  const pathSegment =
    pathname.startsWith("/") && pathname.length > 1 ? pathname.slice(1) : null;

  const conversationId =
    pathSegment && isValidConvexId(pathSegment)
      ? (pathSegment as ConversationId)
      : null;

  const conversation = useGetConversationById(conversationId);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />
      <div className="flex-1">
        {conversation && (
          <h1 className="font-medium text-sm truncate">{conversation.title}</h1>
        )}
      </div>
    </header>
  );
};

export default ConversationHeader;

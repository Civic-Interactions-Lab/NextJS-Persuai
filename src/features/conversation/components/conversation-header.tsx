"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types";

const ConversationHeader = () => {
  const pathname = usePathname();

  const conversationId =
    pathname.startsWith("/") && pathname.length > 1 ? pathname.slice(1) : null;

  const conversation = useQuery(
    api.conversations.getConversationById,
    conversationId ? { id: conversationId as ConversationId } : "skip",
  );

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

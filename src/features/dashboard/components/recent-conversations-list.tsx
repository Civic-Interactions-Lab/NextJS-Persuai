"use client";

import { useGetConversations } from "@/features/conversation/hooks/use-conversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTimeAgo } from "@/lib/utils";
import { ConversationId } from "../../../../convex/types/convexTypes";
import { useState } from "react";
import ConversationSheet from "./conversation-sheet";

const RecentConversationsList = () => {
  const conversations = useGetConversations();
  const [selectedConversationId, setSelectedConversationId] =
    useState<ConversationId | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleConversationClick = (conversationId: ConversationId) => {
    setSelectedConversationId(conversationId);
    setSheetOpen(true);
  };

  return (
    <>
      <div className="rounded-lg border bg-card">
        <div className="p-6 pb-3">
          <h3 className="font-semibold">Recent Conversations</h3>
        </div>
        <ScrollArea className="max-h-[600px]">
          <div className="p-6 pt-0">
            {conversations?.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
            ) : (
              <div className="space-y-3">
                {conversations?.map((conversation) => (
                  <button
                    key={conversation._id}
                    onClick={() => handleConversationClick(conversation._id)}
                    className="w-full flex items-center justify-between text-sm border-b py-2 last:border-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded transition-colors text-left"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conversation.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {conversation.metadata?.topic?.title && (
                          <span className="text-xs text-muted-foreground">
                            {conversation.metadata.topic.title}
                          </span>
                        )}
                        {conversation.metadata?.agent?.name && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              ·
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {conversation.metadata.agent.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                      <span className="text-xs text-muted-foreground max-w-[80px] text-right leading-tight">
                        {formatTimeAgo(conversation.updatedAt)}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                          conversation.status === "complete"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                        }`}
                      >
                        {conversation.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <ConversationSheet
        conversationId={selectedConversationId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
};

export default RecentConversationsList;

"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types";
import {
  Loader2,
  CheckCircleIcon,
  XCircleIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { cn } from "@/lib/utils";

interface ConversationSheetProps {
  conversationId: ConversationId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getMessageStyling = (agreement?: "agree" | "disagree" | "neutral") => {
  if (!agreement) return "";

  switch (agreement) {
    case "agree":
      return "bg-green-50 border-l-4 border-l-green-400 dark:bg-green-950/20 dark:border-l-green-500";
    case "disagree":
      return "bg-red-50 border-l-4 border-l-red-400 dark:bg-red-950/20 dark:border-l-red-500";
    case "neutral":
      return "bg-yellow-50 border-l-4 border-l-yellow-400 dark:bg-yellow-950/20 dark:border-l-yellow-500";
    default:
      return "";
  }
};

const getAgreementIcon = (agreement?: "agree" | "disagree" | "neutral") => {
  if (!agreement) return null;

  switch (agreement) {
    case "agree":
      return <CheckCircleIcon className="size-6 text-green-600" />;
    case "disagree":
      return <XCircleIcon className="size-6 text-red-600" />;
    case "neutral":
      return <TriangleAlertIcon className="size-6 text-yellow-500" />;
  }
};

const ConversationSheet = ({
  conversationId,
  open,
  onOpenChange,
}: ConversationSheetProps) => {
  const conversation = useQuery(
    api.conversations.getConversationById,
    conversationId ? { id: conversationId } : "skip",
  );
  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip",
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col overflow-hidden">
        <SheetHeader className="pb-2">
          <SheetTitle>{conversation?.title || "Conversation"}</SheetTitle>
          {conversation && (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>UID: {conversation.uid}</p>
              {conversation.topic && <p>Topic: {conversation.topic}</p>}
              {conversation.agentName && <p>Agent: {conversation.agentName}</p>}
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 border-t-2 border-muted">
          {!conversationId ||
          conversation === undefined ||
          messages === undefined ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !conversation ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Conversation not found</p>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No messages yet
            </p>
          ) : (
            <div className="space-y-4 pb-4 px-8">
              {messages.map((message) => (
                <Message
                  key={message._id}
                  from={message.role}
                  className={cn(
                    "relative transition-colors duration-200",
                    getMessageStyling(message.agreement),
                  )}
                >
                  <MessageContent>
                    <div
                      className={cn(
                        "flex items-start justify-between",
                        message.role === "assistant" && "p-3",
                      )}
                    >
                      <div className="flex-1">
                        <MessageResponse>{message.content}</MessageResponse>
                      </div>
                    </div>
                  </MessageContent>
                  {message.role === "assistant" && message.agreement && (
                    <div className="shrink-0 pt-1 absolute -top-3 -right-3">
                      {getAgreementIcon(message.agreement)}
                    </div>
                  )}
                </Message>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ConversationSheet;

"use client";

import {
  CopyIcon,
  LoaderIcon,
  AlertCircleIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  MinusCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import { cn } from "@/lib/utils";
import {
  Message as MessageType,
  MessageId,
} from "../../../../convex/types/convexTypes";

interface MessageListProps {
  messages: MessageType[];
  onAgreement: (
    messageId: MessageId,
    agreement: "agree" | "disagree" | "neutral",
  ) => void;
}

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

const getMessageStyling = (agreement?: "agree" | "disagree" | "neutral") => {
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

const MessageList = ({ messages, onAgreement }: MessageListProps) => (
  <>
    {messages.map((message, index) => (
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
              {message.status === "processing" ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LoaderIcon className="size-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              ) : message.status === "error" ? (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircleIcon className="size-4" />
                  <span>Failed to generate response</span>
                </div>
              ) : (
                <MessageResponse>{message.content}</MessageResponse>
              )}
            </div>
          </div>
        </MessageContent>
        {message.role === "assistant" &&
          message.status === "completed" &&
          index === messages.length - 1 && (
            <MessageActions className="justify-end mb-2 mr-2">
              <MessageAction
                onClick={() => onAgreement(message._id, "agree")}
                label="Agree"
              >
                <ThumbsUpIcon className="size-4" />
              </MessageAction>
              <MessageAction
                onClick={() => onAgreement(message._id, "disagree")}
                label="Disagree"
              >
                <ThumbsDownIcon className="size-4" />
              </MessageAction>
              <MessageAction
                onClick={() => onAgreement(message._id, "neutral")}
                label="Neutral"
              >
                <MinusCircleIcon className="size-4" />
              </MessageAction>
              <MessageAction
                onClick={() => navigator.clipboard.writeText(message.content)}
                label="Copy"
              >
                <CopyIcon className="size-4" />
              </MessageAction>
            </MessageActions>
          )}
        {message.role === "assistant" && message.agreement && (
          <div className="shrink-0 pt-1 absolute -top-3 -right-3">
            {getAgreementIcon(message.agreement)}
          </div>
        )}
      </Message>
    ))}
  </>
);

export default MessageList;

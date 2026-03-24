"use client";

import { CopyIcon, LoaderIcon, AlertCircleIcon } from "lucide-react";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import { cn } from "@/lib/utils";
import { LIKERT_LABELS } from "@/features/survey/components/likert-scale";
import {
  Message as MessageType,
  MessageId,
} from "../../../../convex/types/convexTypes";

interface MessageListProps {
  messages: MessageType[];
  onAgreement: (messageId: MessageId, agreement: number) => void;
}

const getMessageStyling = (agreement?: number) => {
  if (agreement === undefined) return "";
  if (agreement < 4)
    return "bg-red-50 border-l-4 border-l-red-400 dark:bg-red-950/20 dark:border-l-red-500";
  if (agreement === 4)
    return "bg-yellow-50 border-l-4 border-l-yellow-400 dark:bg-yellow-950/20 dark:border-l-yellow-500";
  return "bg-green-50 border-l-4 border-l-green-400 dark:bg-green-950/20 dark:border-l-green-500";
};

const getAgreementBadgeStyle = (agreement: number) => {
  if (agreement < 4)
    return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";
  if (agreement === 4)
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";
  return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";
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

        {message.role === "assistant" && message.status === "completed" && (
          <MessageActions className="justify-between items-center mb-2 mx-2">
            {message.agreement !== undefined ? (
              <span
                className={cn(
                  "text-xs font-medium py-0.5 px-2 rounded-full",
                  getAgreementBadgeStyle(message.agreement),
                )}
              >
                {message.agreement} — {LIKERT_LABELS[String(message.agreement)]}
              </span>
            ) : index === messages.length - 1 ? (
              <span className="text-xs text-muted-foreground">
                Rate this response below
              </span>
            ) : (
              <span />
            )}
            <MessageAction
              onClick={() => navigator.clipboard.writeText(message.content)}
              label="Copy"
            >
              <CopyIcon className="size-4" />
            </MessageAction>
          </MessageActions>
        )}
      </Message>
    ))}
  </>
);

export default MessageList;

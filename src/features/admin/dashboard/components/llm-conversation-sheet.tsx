"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bot, UserIcon, AlertCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetLlmConversationById } from "@/features/llm-conversations/hooks/use-llm-conversations";
import { useGetLlmMessages } from "@/features/llm-conversations/hooks/use-llm-messages";
import { LlmConversationId, LlmMessage } from "../../../../../convex/types/convexTypes";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LlmConversationSheetProps {
  conversationId: LlmConversationId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_BADGE: Record<string, { label: string; variant: "secondary" | "destructive" | "outline" | "default" }> = {
  idle: { label: "Ready", variant: "secondary" },
  running: { label: "Running", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  error: { label: "Error", variant: "destructive" },
};

const likertLabel = (n: number): string => {
  if (n === 1) return "Strongly Disagree";
  if (n === 2) return "Disagree";
  if (n === 3) return "Somewhat Disagree";
  if (n === 4) return "Neutral";
  if (n === 5) return "Somewhat Agree";
  if (n === 6) return "Agree";
  return "Strongly Agree";
};

const likertZone = (n: number): "agree" | "neutral" | "disagree" =>
  n <= 3 ? "disagree" : n === 4 ? "neutral" : "agree";

const getAgreementBadgeStyle = (n: number) => {
  const zone = likertZone(n);
  if (zone === "agree") return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";
  if (zone === "disagree") return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";
  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";
};

const getAgentBubbleStyle = (agreement?: number) => {
  if (agreement === undefined) return "";
  const zone = likertZone(agreement);
  if (zone === "agree") return "border-l-4 border-l-green-400 bg-green-50/60 dark:bg-green-950/20 dark:border-l-green-500";
  if (zone === "disagree") return "border-l-4 border-l-red-400 bg-red-50/60 dark:bg-red-950/20 dark:border-l-red-500";
  return "border-l-4 border-l-yellow-400 bg-yellow-50/60 dark:bg-yellow-950/20 dark:border-l-yellow-500";
};

const LlmConversationSheet = ({ conversationId, open, onOpenChange }: LlmConversationSheetProps) => {
  const conversation = useGetLlmConversationById(conversationId);
  const messages = useGetLlmMessages(conversationId);

  const personaName = conversation?.metadata?.persona?.name ?? "Persona";
  const agentName = conversation?.metadata?.agent?.name ?? "Agent";
  const topicIssue = conversation?.metadata?.topic?.issue ?? "";

  const isLoading = conversation === undefined || messages === undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col overflow-hidden">
        <SheetHeader className="pb-2 shrink-0">
          <SheetTitle>{conversation?.title ?? "LLM Debate"}</SheetTitle>
          {conversation && (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={STATUS_BADGE[conversation.status]?.variant ?? "secondary"}>
                {STATUS_BADGE[conversation.status]?.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {conversation.roundCount}/{conversation.maxRounds} rounds
              </span>
              {topicIssue && (
                <span className="text-xs text-muted-foreground truncate">{topicIssue}</span>
              )}
            </div>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1 py-2 text-xs text-muted-foreground border-y shrink-0">
              <span className="flex items-center gap-1.5">
                <Bot className="size-3" />
                <span className="font-medium">{agentName}</span>
                <span className="opacity-60">— Agent</span>
              </span>
              <span className="flex items-center gap-1.5">
                {conversation?.preTopicRating !== undefined && (
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", getAgreementBadgeStyle(conversation.preTopicRating))}>
                    Pre: {conversation.preTopicRating}/7 · {likertLabel(conversation.preTopicRating)}
                  </span>
                )}
                <span className="opacity-60">Persona —</span>
                <span className="font-medium">{personaName}</span>
                <UserIcon className="size-3" />
              </span>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="px-4 py-4 space-y-3 max-w-full">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No messages yet</p>
                ) : (
                  messages.map((msg: LlmMessage) => (
                    <MessageBubble
                      key={msg._id}
                      message={msg}
                      personaName={personaName}
                      agentName={agentName}
                    />
                  ))
                )}
              </div>
            </ScrollArea>

            {(conversation?.preTopicRating !== undefined || conversation?.postTopicRating !== undefined) && (
              <div className="border-t px-4 py-3 shrink-0 bg-muted/30">
                <p className="text-xs text-muted-foreground text-center mb-2">
                  {personaName}&apos;s topic rating
                </p>
                <div className="flex items-center justify-center gap-6">
                  {conversation.preTopicRating !== undefined && (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Pre-debate</span>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getAgreementBadgeStyle(conversation.preTopicRating))}>
                        {conversation.preTopicRating}/7 · {likertLabel(conversation.preTopicRating)}
                      </span>
                    </div>
                  )}
                  {conversation.preTopicRating !== undefined && conversation.postTopicRating !== undefined && (
                    <span className="text-muted-foreground text-xs">→</span>
                  )}
                  {conversation.postTopicRating !== undefined && (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Post-debate</span>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getAgreementBadgeStyle(conversation.postTopicRating))}>
                        {conversation.postTopicRating}/7 · {likertLabel(conversation.postTopicRating)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default LlmConversationSheet;

const MessageBubble = ({
  message,
  personaName,
  agentName,
}: {
  message: LlmMessage;
  personaName: string;
  agentName: string;
}) => {
  const isPersona = message.role === "persona";
  const displayName = isPersona ? personaName : agentName;

  return (
    <div className={cn("flex gap-2 mb-2", isPersona ? "flex-row-reverse items-end" : "flex-row items-end")}>
      {!isPersona && (
        <div className="shrink-0 size-6 rounded-full bg-muted flex items-center justify-center self-start mt-5">
          <Bot className="size-3.5 text-muted-foreground" />
        </div>
      )}
      <div className={cn("flex flex-col gap-1 max-w-[75%]", isPersona ? "items-end" : "items-start")}>
        <span className="text-[10px] text-muted-foreground px-1">
          {displayName} · Round {message.round}
        </span>
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isPersona
              ? "bg-secondary text-foreground"
              : cn("bg-muted text-foreground", getAgentBubbleStyle(message.agreement)),
          )}
        >
          {message.status === "processing" ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Thinking...</span>
            </div>
          ) : message.status === "error" ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircleIcon className="size-3.5" />
              <span>Failed</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        {!isPersona && message.agreement !== undefined && message.status === "completed" && (
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", getAgreementBadgeStyle(message.agreement))}>
            {message.agreement}/7 · {likertLabel(message.agreement)}
          </span>
        )}
      </div>
    </div>
  );
};

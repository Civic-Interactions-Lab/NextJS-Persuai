"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderIcon,
  AlertCircleIcon,
  Bot,
  UserIcon,
  PlayIcon,
  RotateCcwIcon,
} from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetLlmConversationById } from "@/features/llm-conversations/hooks/use-llm-conversations";
import { useGetLlmMessages } from "@/features/llm-conversations/hooks/use-llm-messages";
import {
  LlmConversationId,
  LlmMessage,
} from "../../../../convex/types/convexTypes";
import { cn } from "@/lib/utils";

interface LlmConversationViewProps {
  conversationId: LlmConversationId;
}

const STATUS_BADGE: Record<
  string,
  {
    label: string;
    variant: "secondary" | "destructive" | "outline" | "default";
  }
> = {
  idle: { label: "Ready", variant: "secondary" },
  running: { label: "Running", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  error: { label: "Error", variant: "destructive" },
};

const LlmConversationView = ({ conversationId }: LlmConversationViewProps) => {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const conversation = useGetLlmConversationById(conversationId);
  const messages = useGetLlmMessages(conversationId);

  // Redirect if conversation not found after loading
  useEffect(() => {
    if (conversation === null) {
      router.push("/llm-conversations");
    }
  }, [conversation, router]);

  // Auto-start debate when conversation first loads and is idle with no messages
  useEffect(() => {
    if (
      conversation?.status === "idle" &&
      messages !== undefined &&
      messages.length === 0 &&
      !isRunning
    ) {
      startDebate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?._id, messages?.length]);

  const callTurn = async (turn: "persona" | "agent"): Promise<boolean> => {
    const res = await fetch("/api/llm-debate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ llmConversationId: conversationId, turn }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.done === true;
  };

  const startDebate = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setRunError(null);
    abortRef.current = false;

    try {
      let done = false;
      while (!done && !abortRef.current) {
        await callTurn("persona");
        if (abortRef.current) break;

        // Small gap so the UI shows the persona bubble before agent starts
        await new Promise((r) => setTimeout(r, 800));

        done = await callTurn("agent");
      }
    } catch (err) {
      setRunError("Something went wrong. You can try resuming.");
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    abortRef.current = true;
  };

  if (conversation === undefined || messages === undefined) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="flex items-center gap-2">
          <LoaderIcon className="size-4 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  const progress = conversation
    ? Math.round((conversation.roundCount / conversation.maxRounds) * 100)
    : 0;

  const isCompleted = conversation?.status === "completed";
  const isError = conversation?.status === "error";
  const canResume =
    !isRunning && !isCompleted && (conversation?.status === "idle" || isError);

  const personaName = conversation?.metadata?.persona?.name ?? "Persona";
  const agentName = conversation?.metadata?.agent?.name ?? "Agent";
  const topicIssue = conversation?.metadata?.topic?.issue ?? "";

  return (
    <>
      {/* Header */}
      <div className="border-b px-3 py-3 flex items-center gap-3 shrink-0">
        <SidebarTrigger className="size-8 shrink-0" />

        <div className="flex flex-col min-w-0 flex-1">
          <h1 className="font-semibold text-sm truncate">
            {conversation?.title ?? "Loading..."}
          </h1>
          {topicIssue && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {topicIssue}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {conversation && (
            <>
              <Badge
                variant={
                  STATUS_BADGE[conversation.status]?.variant ?? "secondary"
                }
                className={cn(
                  "text-xs",
                  conversation.status === "running" && "animate-pulse",
                )}
              >
                {STATUS_BADGE[conversation.status]?.label}
              </Badge>

              <span className="text-xs text-muted-foreground">
                Round {conversation.roundCount}/{conversation.maxRounds}
              </span>

              {isRunning ? (
                <Button size="sm" variant="outline" onClick={handleStop}>
                  Stop
                </Button>
              ) : canResume ? (
                <Button size="sm" onClick={startDebate}>
                  <PlayIcon className="size-3 mr-1" />
                  {messages.length === 0 ? "Start" : "Resume"}
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {conversation && (
        <div className="px-4 py-1 shrink-0">
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {/* Participant labels */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground border-b shrink-0">
        <span className="flex items-center gap-1.5">
          <Bot className="size-3" />
          <span className="font-medium">{agentName}</span>
          <span className="opacity-60">— Agent</span>
        </span>

        <span className="flex items-center gap-1.5">
          {conversation?.preTopicRating !== undefined && (
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                getAgreementBadgeStyle(conversation.preTopicRating),
              )}
            >
              Pre: {conversation.preTopicRating}/7 · {likertLabel(conversation.preTopicRating)}
            </span>
          )}
          <span className="opacity-60">Persona —</span>
          <span className="font-medium">{personaName}</span>
          <UserIcon className="size-3" />
        </span>
      </div>

      {/* Message area */}
      <div className="relative flex-1 min-h-0">
        <Conversation className="absolute inset-0">
          <ConversationContent className="px-4 py-4 space-y-1 max-w-4xl mx-auto w-full">
            {messages.length === 0 && !isRunning ? (
              <div className="flex items-center justify-center pt-[25vh] text-muted-foreground text-sm">
                Press Start to begin the debate.
              </div>
            ) : (
              messages.map((msg: LlmMessage) => (
                <LlmMessageBubble
                  key={msg._id}
                  message={msg}
                  personaName={personaName}
                  agentName={agentName}
                />
              ))
            )}

            {runError && (
              <div className="flex items-center gap-2 text-destructive text-sm p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                <AlertCircleIcon className="size-4 shrink-0" />
                <span>{runError}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={startDebate}
                >
                  <RotateCcwIcon className="size-3 mr-1" />
                  Retry
                </Button>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Footer */}
      {isCompleted && (
        <div className="border-t px-4 py-3 shrink-0 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center mb-2">
            Debate completed after {conversation.roundCount} rounds.
          </p>
          {/* Topic ratings */}
          {(conversation.preTopicRating !== undefined ||
            conversation.postTopicRating !== undefined) && (
            <div className="flex items-center justify-center gap-6">
              {conversation.preTopicRating !== undefined && (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                    Pre-debate
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      getAgreementBadgeStyle(conversation.preTopicRating),
                    )}
                  >
                    {conversation.preTopicRating}/7 ·{" "}
                    {likertLabel(conversation.preTopicRating)}
                  </span>
                </div>
              )}
              {conversation.preTopicRating !== undefined &&
                conversation.postTopicRating !== undefined && (
                  <span className="text-muted-foreground text-xs">→</span>
                )}
              {conversation.postTopicRating !== undefined && (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                    Post-debate
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      getAgreementBadgeStyle(conversation.postTopicRating),
                    )}
                  >
                    {conversation.postTopicRating}/7 ·{" "}
                    {likertLabel(conversation.postTopicRating)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ─── Likert helpers ─────────────────────────────────────────────────────── */
// 1–3 = disagree, 4 = neutral, 5–7 = agree
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

// Agreement styling applied to the agent bubble
const getAgentBubbleStyle = (agreement?: number) => {
  if (agreement === undefined) return "";
  const zone = likertZone(agreement);
  if (zone === "agree")
    return "border-l-4 border-l-green-400 bg-green-50/60 dark:bg-green-950/20 dark:border-l-green-500";
  if (zone === "disagree")
    return "border-l-4 border-l-red-400 bg-red-50/60 dark:bg-red-950/20 dark:border-l-red-500";
  return "border-l-4 border-l-yellow-400 bg-yellow-50/60 dark:bg-yellow-950/20 dark:border-l-yellow-500";
};

const getAgreementBadgeStyle = (agreement: number) => {
  const zone = likertZone(agreement);
  if (zone === "agree")
    return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";
  if (zone === "disagree")
    return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";
  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";
};

/* ─── Individual Message Bubble ─────────────────────────────────────────── */
interface LlmMessageBubbleProps {
  message: LlmMessage;
  personaName: string;
  agentName: string;
}

const LlmMessageBubble = ({
  message,
  personaName,
  agentName,
}: LlmMessageBubbleProps) => {
  // Agent = left side, Persona = right side
  const isPersona = message.role === "persona";
  const displayName = isPersona ? personaName : agentName;

  return (
    <div
      className={cn(
        "flex gap-2 mb-3",
        isPersona ? "flex-row-reverse items-end" : "flex-row items-end",
      )}
    >
      {/* Avatar — only shown for agent (left side) */}
      {!isPersona && (
        <div className="shrink-0 size-7 rounded-full bg-muted flex items-center justify-center self-start mt-5">
          <Bot className="size-4 text-muted-foreground" />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-1",
          isPersona ? "items-end" : "items-start",
        )}
      >
        <span className="text-[10px] text-muted-foreground px-1">
          {displayName} · Round {message.round}
        </span>

        <Message
          from={isPersona ? "user" : "assistant"}
          className={cn(
            "max-w-[75vw] sm:max-w-[65%] min-w-32 transition-colors duration-300 pl-2",
            !isPersona && getAgentBubbleStyle(message.agreement),
          )}
        >
          <MessageContent>
            <div className="p-1 text-left">
              {message.status === "processing" ? (
                <div className="flex w-full items-center gap-2 text-muted-foreground text-sm">
                  <LoaderIcon className="size-4 animate-spin shrink-0" />
                  <span>Thinking...</span>
                </div>
              ) : message.status === "error" ? (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircleIcon className="size-4 shrink-0" />
                  <span>Failed to generate response</span>
                </div>
              ) : (
                <MessageResponse>{message.content}</MessageResponse>
              )}
            </div>
          </MessageContent>

          {/* Persona's rating of this agent response — shown at the bottom of agent bubbles */}
          {!isPersona &&
            message.agreement !== undefined &&
            message.status === "completed" && (
              <div className="px-3 pb-2">
                <span
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                    getAgreementBadgeStyle(message.agreement),
                  )}
                >
                  {message.agreement}/7 · {likertLabel(message.agreement)} ({personaName})
                </span>
              </div>
            )}
        </Message>
      </div>
    </div>
  );
};

export default LlmConversationView;

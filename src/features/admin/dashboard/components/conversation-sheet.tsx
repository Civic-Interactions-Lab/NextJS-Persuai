"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversationId } from "../../../../../convex/types/convexTypes";
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
import { useGetAgentById } from "@/features/admin/settings/hooks/use-agents";
import { useGetSurveyResponsesByConversation } from "@/features/survey/hooks/use-surveys";
import { useGetTopicById } from "@/features/admin/settings/hooks/use-topics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Dot,
} from "recharts";
import { LIKERT_LABELS } from "@/features/survey/components/likert-scale";
import { useGetConversationById } from "@/features/conversation/hooks/use-conversations";
import { useGetMessages } from "@/features/conversation/hooks/use-messages";

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

// Determine political leaning from orientation value
const getPoliticalLeaning = (
  orientation: string | undefined,
): "left" | "right" | "neutral" => {
  if (!orientation) return "neutral";
  const v = Number(orientation);
  if (v <= 3) return "left";
  if (v >= 5) return "right";
  return "neutral";
};

const getAgentLeaning = (
  position: string | undefined,
): "left" | "right" | "neutral" => {
  if (position === "manipulative_left") return "left";
  if (position === "manipulative_right") return "right";
  return "neutral"; // non_manipulative
};

// +1 or -1 based on leaning relationship
const getStanceDelta = (
  userLeaning: "left" | "right" | "neutral",
  agentLeaning: "left" | "right" | "neutral",
  agreement: "agree" | "disagree" | "neutral",
): number => {
  if (agreement === "neutral") return 0;

  const sameSide =
    agentLeaning === "neutral" ||
    userLeaning === "neutral" ||
    userLeaning === agentLeaning;

  const baseAgree = sameSide ? 1 : -1;
  return agreement === "agree" ? baseAgree : -baseAgree;
};

const AnalysisTab = ({
  conversationId,
  agentPosition,
}: {
  conversationId: ConversationId;
  agentPosition: string | undefined;
}) => {
  const surveyResponses = useGetSurveyResponsesByConversation(conversationId);
  const messages = useGetMessages(conversationId);
  const conversation = useGetConversationById(conversationId);
  const topic = useGetTopicById(conversation?.topicId ?? null);

  if (!surveyResponses || !messages || !conversation || !topic) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const preSurvey = surveyResponses.find((r) => r.type === "pre");
  const postSurvey = surveyResponses.find((r) => r.type === "post");

  const initialStanceStr = preSurvey?.answers.find(
    (a) => a.questionId === "topicStance",
  )?.value;
  const finalStanceStr = postSurvey?.answers.find(
    (a) => a.questionId === "topicStance",
  )?.value;
  const politicalOrientationStr = preSurvey?.answers.find(
    (a) => a.questionId === "politicalOrientation",
  )?.value;

  const initialStance = initialStanceStr ? Number(initialStanceStr) : null;
  const surveyFinalStance = finalStanceStr ? Number(finalStanceStr) : null;

  const userLeaning = getPoliticalLeaning(politicalOrientationStr);
  const agentLeaning = getAgentLeaning(agentPosition);

  // Build progression through the conversation
  const assistantMessages = messages.filter(
    (m) => m.role === "assistant" && m.status === "completed" && m.agreement,
  );

  const progression: { round: number; stance: number; agreement: string }[] =
    [];

  if (initialStance !== null) {
    let current = initialStance;
    progression.push({ round: 0, stance: current, agreement: "start" });

    assistantMessages.forEach((msg, i) => {
      if (!msg.agreement) return;
      const delta = getStanceDelta(userLeaning, agentLeaning, msg.agreement);
      current = Math.min(7, Math.max(1, current + delta));
      progression.push({
        round: i + 1,
        stance: current,
        agreement: msg.agreement,
      });
    });
  }

  const conversationFinalStance =
    progression.length > 1 ? progression[progression.length - 1].stance : null;

  const totalChange =
    conversationFinalStance !== null && initialStance !== null
      ? conversationFinalStance - initialStance
      : null;

  const dotColor = (agreement: string) => {
    if (agreement === "agree") return "#4e8a42";
    if (agreement === "disagree") return "#c0392b";
    if (agreement === "neutral") return "#b8b4ac";
    return "#888";
  };

  return (
    <div className="space-y-4 py-4">
      {/* Topic */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">{topic.issue}</p>
        </CardContent>
      </Card>

      {/* Stance summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-1">Initial Stance</p>
            <p className="text-2xl font-bold">{initialStance ?? "—"}</p>
            {initialStance && (
              <p className="text-xs text-muted-foreground mt-1">
                {LIKERT_LABELS[String(initialStance)]}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-1">After Debate</p>
            <p className="text-2xl font-bold">
              {conversationFinalStance ?? "—"}
            </p>
            {conversationFinalStance && (
              <p className="text-xs text-muted-foreground mt-1">
                {LIKERT_LABELS[String(conversationFinalStance)]}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-1">Survey Final</p>
            <p className="text-2xl font-bold">{surveyFinalStance ?? "—"}</p>
            {surveyFinalStance && (
              <p className="text-xs text-muted-foreground mt-1">
                {LIKERT_LABELS[String(surveyFinalStance)]}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change summary */}
      {totalChange !== null && (
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-1">
              Total Shift (debate)
            </p>
            <p
              className={cn(
                "text-xl font-bold",
                totalChange > 0 && "text-green-600",
                totalChange < 0 && "text-red-600",
                totalChange === 0 && "text-muted-foreground",
              )}
            >
              {totalChange > 0
                ? `+${totalChange}`
                : totalChange === 0
                  ? "No change"
                  : totalChange}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalChange > 0
                ? "Moved toward agreement"
                : totalChange < 0
                  ? "Moved toward disagreement"
                  : "Stance remained the same"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Progression chart */}
      {progression.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Stance Progression
            </CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#4e8a42",
                    display: "inline-block",
                  }}
                />
                Agreed
              </span>
              <span className="flex items-center gap-1">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#c0392b",
                    display: "inline-block",
                  }}
                />
                Disagreed
              </span>
              <span className="flex items-center gap-1">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#b8b4ac",
                    display: "inline-block",
                  }}
                />
                Neutral
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={progression}
                  margin={{ top: 8, right: 16, left: -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="round"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: "Round",
                      position: "insideBottom",
                      offset: -2,
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    domain={[1, 7]}
                    ticks={[1, 2, 3, 4, 5, 6, 7]}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ReferenceLine y={4} strokeDasharray="4 4" stroke="#b8b4ac" />
                  <Line
                    type="monotone"
                    dataKey="stance"
                    stroke="#888"
                    strokeWidth={2}
                    isAnimationActive={false}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      return (
                        <Dot
                          key={payload.round}
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill={dotColor(payload.agreement)}
                          stroke="#fff"
                          strokeWidth={1.5}
                        />
                      );
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              1 = Strongly Disagree · 7 = Strongly Agree
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ConversationSheet = ({
  conversationId,
  open,
  onOpenChange,
}: ConversationSheetProps) => {
  const conversation = useGetConversationById(conversationId);
  const messages = useGetMessages(conversationId);
  const agent = useGetAgentById(conversation?.agentId ?? null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col overflow-hidden">
        <SheetHeader className="pb-2">
          <SheetTitle>{conversation?.title || "Conversation"}</SheetTitle>
          {conversation && (
            <div className="space-y-1 text-sm text-muted-foreground">
              {agent?.name && <p>Agent: {agent.name}</p>}
              {agent?.description && <p>{agent.description}</p>}
            </div>
          )}
        </SheetHeader>

        <Tabs
          defaultValue="conversation"
          className="flex flex-col flex-1 min-h-0 px-3"
        >
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="conversation" className="flex-1">
              Conversation
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex-1">
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="conversation"
            className="flex-1 overflow-y-auto mt-0"
          >
            <div className="py-4 border-t border-muted">
              {!conversationId ||
              conversation === undefined ||
              messages === undefined ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : !conversation ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">
                    Conversation not found
                  </p>
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
          </TabsContent>

          <TabsContent
            value="analysis"
            className="flex-1 overflow-y-auto mt-0 px-1"
          >
            {conversationId && (
              <AnalysisTab
                conversationId={conversationId}
                agentPosition={agent?.position}
              />
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ConversationSheet;

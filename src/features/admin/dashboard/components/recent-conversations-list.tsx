"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/utils";
import {
  Conversation,
  ConversationId,
  LlmConversation,
  LlmConversationId,
} from "../../../../../convex/types/convexTypes";
import { ConversationFilter } from "../views/dashboard-view";
import ConversationSheet from "./conversation-sheet";
import LlmConversationSheet from "./llm-conversation-sheet";
import { useGetAgentById } from "@/features/admin/settings/hooks/use-agents";

interface Props {
  conversations: Conversation[];
  llmConversations: LlmConversation[];
  filter: ConversationFilter;
}

type UnifiedRow =
  | { kind: "human"; data: Conversation }
  | { kind: "llm"; data: LlmConversation };

const RecentConversationsList = ({ conversations, llmConversations, filter }: Props) => {
  const [selectedHumanId, setSelectedHumanId] = useState<ConversationId | null>(null);
  const [selectedLlmId, setSelectedLlmId] = useState<LlmConversationId | null>(null);
  const [humanSheetOpen, setHumanSheetOpen] = useState(false);
  const [llmSheetOpen, setLlmSheetOpen] = useState(false);

  const rows: UnifiedRow[] = [
    ...(filter === "all" || filter === "human"
      ? conversations.map((c): UnifiedRow => ({ kind: "human", data: c }))
      : []),
    ...(filter === "all" || filter === "llm"
      ? llmConversations.map((c): UnifiedRow => ({ kind: "llm", data: c }))
      : []),
  ].sort((a, b) => b.data.updatedAt - a.data.updatedAt);

  return (
    <>
      <div className="rounded-lg border bg-card">
        <div className="p-6 pb-3">
          <h3 className="font-semibold">Recent Conversations</h3>
        </div>
        <ScrollArea className="max-h-[600px]">
          <div className="p-6 pt-0">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            ) : (
              <div className="space-y-3">
                {rows.map((row) =>
                  row.kind === "human" ? (
                    <HumanConversationRow
                      key={row.data._id}
                      conversation={row.data}
                      onClick={() => {
                        setSelectedHumanId(row.data._id as ConversationId);
                        setHumanSheetOpen(true);
                      }}
                    />
                  ) : (
                    <LlmConversationRow
                      key={row.data._id}
                      conversation={row.data}
                      onClick={() => {
                        setSelectedLlmId(row.data._id as LlmConversationId);
                        setLlmSheetOpen(true);
                      }}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <ConversationSheet
        conversationId={selectedHumanId}
        open={humanSheetOpen}
        onOpenChange={setHumanSheetOpen}
      />
      <LlmConversationSheet
        conversationId={selectedLlmId}
        open={llmSheetOpen}
        onOpenChange={setLlmSheetOpen}
      />
    </>
  );
};

export default RecentConversationsList;

const HumanConversationRow = ({
  conversation,
  onClick,
}: {
  conversation: Conversation;
  onClick: () => void;
}) => {
  const agent = useGetAgentById(conversation.agentId ?? null);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between text-sm border-b py-2 last:border-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded transition-colors text-left"
    >
      <div className="space-y-1 flex-1 min-w-0">
        <p className="font-medium truncate">{conversation.title}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] px-1 py-0">Human</Badge>
          {agent?.name && (
            <span className="text-xs text-muted-foreground">{agent.name}</span>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground ml-2 shrink-0">
        {formatTimeAgo(conversation.updatedAt)}
      </span>
    </button>
  );
};

const STATUS_DOT: Record<string, string> = {
  idle: "bg-muted-foreground",
  running: "bg-yellow-400",
  completed: "bg-green-400",
  error: "bg-red-400",
};

const LlmConversationRow = ({
  conversation,
  onClick,
}: {
  conversation: LlmConversation;
  onClick: () => void;
}) => {
  const personaName = conversation.metadata?.persona?.name;
  const agentName = conversation.metadata?.agent?.name;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between text-sm border-b py-2 last:border-0 last:pb-0 hover:bg-accent/50 -mx-2 px-2 rounded transition-colors text-left"
    >
      <div className="space-y-1 flex-1 min-w-0">
        <p className="font-medium truncate">{conversation.title}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] px-1 py-0">LLM</Badge>
          <span className={`size-1.5 rounded-full ${STATUS_DOT[conversation.status] ?? "bg-muted-foreground"}`} />
          <span className="text-xs text-muted-foreground">
            {personaName} vs {agentName}
          </span>
          <span className="text-xs text-muted-foreground">
            {conversation.roundCount}/{conversation.maxRounds} rounds
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground ml-2 shrink-0">
        {formatTimeAgo(conversation.updatedAt)}
      </span>
    </button>
  );
};

"use client";

import { useState } from "react";
import { useGetConversations } from "@/features/conversation/hooks/use-conversations";
import { useGetLlmConversations } from "@/features/llm-conversations/hooks/use-llm-conversations";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TotalConversationsCard,
  WeeklyTrendingCard,
} from "@/features/admin/dashboard/components/conversation-stats-cards";
import MostPickedTopicSection from "@/features/admin/dashboard/components/most-picked-topic-section";
import RecentConversationsList from "@/features/admin/dashboard/components/recent-conversations-list";

export type ConversationFilter = "all" | "human" | "llm";

const DashboardView = () => {
  const conversations = useGetConversations();
  const llmConversations = useGetLlmConversations();
  const [filter, setFilter] = useState<ConversationFilter>("all");

  const isLoading =
    conversations === undefined || llmConversations === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of conversations and activity
          </p>
        </div>
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as ConversationFilter)}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="human">Human vs. Agent</SelectItem>
            <SelectItem value="llm">LLM vs. LLM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="lg:hidden space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TotalConversationsCard
            conversations={conversations}
            llmConversations={llmConversations}
            filter={filter}
          />
          <WeeklyTrendingCard
            conversations={conversations}
            llmConversations={llmConversations}
            filter={filter}
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <MostPickedTopicSection
            conversations={conversations}
            llmConversations={llmConversations}
            filter={filter}
          />
          <RecentConversationsList
            conversations={conversations}
            llmConversations={llmConversations}
            filter={filter}
          />
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 grid-cols-2">
            <TotalConversationsCard
              conversations={conversations}
              llmConversations={llmConversations}
              filter={filter}
            />
            <WeeklyTrendingCard
              conversations={conversations}
              llmConversations={llmConversations}
              filter={filter}
            />
          </div>
          <MostPickedTopicSection
            conversations={conversations}
            llmConversations={llmConversations}
            filter={filter}
          />
        </div>
        <div className="lg:col-span-1">
          <RecentConversationsList
            conversations={conversations}
            llmConversations={llmConversations}
            filter={filter}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

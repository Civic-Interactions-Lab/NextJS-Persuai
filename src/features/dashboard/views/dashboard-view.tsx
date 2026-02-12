"use client";

import { useGetConversations } from "@/features/conversation/hooks/use-conversations";
import { Loader2 } from "lucide-react";
import {
  TotalConversationsCard,
  WeeklyTrendingCard,
} from "@/features/dashboard/components/conversation-stats-cards";
import MostPickedTopicSection from "@/features/dashboard/components/most-picked-topic-section";
import RecentConversationsList from "@/features/dashboard/components/recent-conversations-list";
import SurveyResultsSection from "@/features/dashboard/components/survey-results-section";

const DashboardView = () => {
  const conversations = useGetConversations();

  if (conversations === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of conversations and activity
        </p>
      </div>

      {/* md layout: Cards full width, then Most Picked | Recent side-by-side */}
      <div className="lg:hidden space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TotalConversationsCard />
          <WeeklyTrendingCard />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MostPickedTopicSection />
          <RecentConversationsList />
        </div>

        <SurveyResultsSection />
      </div>

      {/* lg layout: Left (Cards + Most Picked) | Right (Recent) */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 grid-cols-2">
            <TotalConversationsCard />
            <WeeklyTrendingCard />
          </div>
          <MostPickedTopicSection />

          <SurveyResultsSection />
        </div>

        <div className="lg:col-span-1">
          <RecentConversationsList />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

"use client";

import { useGetConversations } from "@/features/conversation/hooks/use-conversations";
import { MessageSquare, Calendar } from "lucide-react";
import { useMemo } from "react";

function getWeekRange(weeksAgo: number): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - diffToMonday);
  thisMonday.setHours(0, 0, 0, 0);

  const start = new Date(thisMonday);
  start.setDate(thisMonday.getDate() - weeksAgo * 7);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export const TotalConversationsCard = () => {
  const conversations = useGetConversations();
  const total = conversations?.length ?? 0;

  return (
    <div className="rounded-lg border bg-card p-6 relative">
      <MessageSquare className="size-6 text-muted-foreground/30 absolute top-6 right-6" />
      <h3 className="text-sm font-medium text-muted-foreground">
        Total Conversations
      </h3>
      <p className="text-3xl font-bold mt-2">{total}</p>
    </div>
  );
};

export const WeeklyTrendingCard = () => {
  const conversations = useGetConversations();

  const { thisWeekCount, lastWeekCount, diff } = useMemo(() => {
    if (!conversations) return { thisWeekCount: 0, lastWeekCount: 0, diff: 0 };

    const thisWeek = getWeekRange(0);
    const lastWeek = getWeekRange(1);

    let thisWeekCount = 0;
    let lastWeekCount = 0;

    conversations.forEach((conv) => {
      const date = new Date(conv._creationTime);

      if (date >= thisWeek.start && date <= thisWeek.end) {
        thisWeekCount++;
      } else if (date >= lastWeek.start && date <= lastWeek.end) {
        lastWeekCount++;
      }
    });

    return {
      thisWeekCount,
      lastWeekCount,
      diff: thisWeekCount - lastWeekCount,
    };
  }, [conversations]);

  return (
    <div className="rounded-lg border bg-card p-6 relative">
      <Calendar className="size-6 text-muted-foreground/30 absolute top-6 right-6" />
      <h3 className="text-sm font-medium text-muted-foreground">This Week</h3>
      <p className="text-3xl font-bold mt-2">{thisWeekCount}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {diff > 0 ? "+" : ""}
        {diff} vs last week ({lastWeekCount})
      </p>
    </div>
  );
};

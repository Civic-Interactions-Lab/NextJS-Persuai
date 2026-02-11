"use client";

import { useGetConversations } from "@/features/conversation/hooks/use-conversations";
import { Loader2 } from "lucide-react";

const DashboardView = () => {
  const conversations = useGetConversations();

  if (conversations === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalConversations = conversations.length;
  const conversationsToday = conversations.filter((conv) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return conv._creationTime >= today.getTime();
  }).length;

  const conversationsThisWeek = conversations.filter((conv) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return conv._creationTime >= weekAgo.getTime();
  }).length;

  const recentConversations = conversations.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your conversations and activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Conversations
          </h3>
          <p className="text-3xl font-bold mt-2">{totalConversations}</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            This Week
          </h3>
          <p className="text-3xl font-bold mt-2">{conversationsThisWeek}</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Today</h3>
          <p className="text-3xl font-bold mt-2">{conversationsToday}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Recent Conversations</h3>
        {recentConversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conversations yet</p>
        ) : (
          <div className="space-y-3">
            {recentConversations.map((conversation) => (
              <div
                key={conversation._id}
                className="flex items-center justify-between text-sm border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground">
                    UID: {conversation.uid}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(conversation._creationTime).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;

"use client";

import { useGetTopics } from "@/features/admin/settings/hooks/use-topics";
import { Conversation, LlmConversation } from "../../../../../convex/types/convexTypes";
import { ConversationFilter } from "../views/dashboard-view";

interface Props {
  conversations: Conversation[];
  llmConversations: LlmConversation[];
  filter: ConversationFilter;
}

const MostPickedTopicSection = ({ conversations, llmConversations, filter }: Props) => {
  const topics = useGetTopics();

  if (!topics) return null;

  const topicCounts: Record<string, number> = {};

  if (filter === "all" || filter === "human") {
    conversations.forEach((conv) => {
      if (conv.topicId) topicCounts[conv.topicId] = (topicCounts[conv.topicId] || 0) + 1;
    });
  }

  if (filter === "all" || filter === "llm") {
    llmConversations.forEach((conv) => {
      if (conv.topicId) topicCounts[conv.topicId] = (topicCounts[conv.topicId] || 0) + 1;
    });
  }

  let mostPopularTopic = "No data";
  let mostPopularTopicId = "";
  const entries = Object.entries(topicCounts);

  if (entries.length > 0) {
    const [topicId] = entries.reduce((max, entry) => (entry[1] > max[1] ? entry : max));
    mostPopularTopicId = topicId;
    const topic = topics.find((t) => t._id === topicId);
    mostPopularTopic = topic?.issue ?? "Unknown topic";
  }

  const maxCount = Math.max(...Object.values(topicCounts), 1);

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Most Picked Topic</h3>
        <p className="text-2xl font-bold">{mostPopularTopic}</p>
        {entries.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {topicCounts[mostPopularTopicId]} picks
          </p>
        )}
      </div>

      <div className="space-y-3">
        {topics.map((topic) => {
          const count = topicCounts[topic._id] || 0;
          const percentage = maxCount > 0 ? Math.max((count / maxCount) * 100, 0) : 0;
          const isPopular = topic._id === mostPopularTopicId;

          return (
            <div key={topic._id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${isPopular ? "text-primary" : "text-foreground"}`}>
                  {topic.issue}
                </span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isPopular ? "bg-primary" : "bg-primary/50"}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MostPickedTopicSection;

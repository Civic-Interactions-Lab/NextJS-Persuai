"use client";

import { useGetConversations } from "@/features/conversation/hooks/use-conversations";
import { useGetTopics } from "@/features/admin/settings/hooks/use-topics";

const MostPickedTopicSection = () => {
  const conversations = useGetConversations();
  const topics = useGetTopics();

  if (!topics) return null;

  const topicCounts =
    conversations?.reduce(
      (acc, conv) => {
        if (conv.topicId) {
          acc[conv.topicId] = (acc[conv.topicId] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  let mostPopularTopic = "No data";
  let mostPopularTopicId = "";
  const entries = Object.entries(topicCounts);

  if (entries.length > 0) {
    const [topicId] = entries.reduce((max, entry) =>
      entry[1] > max[1] ? entry : max,
    );
    mostPopularTopicId = topicId;
    const topic = topics.find((t) => t._id === topicId);
    mostPopularTopic = topic?.issue ?? "Unknown topic";
  }

  const maxCount = Math.max(...Object.values(topicCounts), 1);

  if (!topics) return null;

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Most Picked Topic
        </h3>
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
          const percentage =
            maxCount > 0 ? Math.max((count / maxCount) * 100, 0) : 0;
          const isPopular = topic._id === mostPopularTopicId;

          return (
            <div key={topic._id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`font-medium ${isPopular ? "text-primary" : "text-foreground"}`}
                >
                  {topic.issue}
                </span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPopular ? "bg-primary" : "bg-primary/50"
                  }`}
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

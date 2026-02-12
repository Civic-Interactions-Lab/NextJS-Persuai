"use client";

import { useGetConversations } from "@/features/conversation/hooks/use-conversations";
import { DEBATE_TOPICS } from "@/features/conversation/constants/topics";

const MostPickedTopicSection = () => {
  const conversations = useGetConversations();

  // Count topics
  const topicCounts =
    conversations?.reduce(
      (acc, conv) => {
        if (conv.topic) {
          acc[conv.topic] = (acc[conv.topic] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  // Find most popular topic
  let mostPopularTopic = "No data";
  let mostPopularTopicId = "";
  const entries = Object.entries(topicCounts);

  if (entries.length > 0) {
    const [topicId] = entries.reduce((max, entry) =>
      entry[1] > max[1] ? entry : max,
    );
    mostPopularTopicId = topicId;

    const topic = DEBATE_TOPICS.find((t) => t.id === topicId);
    mostPopularTopic = topic?.label || topicId;
  }

  // Calculate max count for normalization
  const maxCount = Math.max(...Object.values(topicCounts), 1);

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
        {DEBATE_TOPICS.map((topic) => {
          const count = topicCounts[topic.id] || 0;
          const percentage =
            maxCount > 0 ? Math.max((count / maxCount) * 100, 0) : 0;
          const isPopular = topic.id === mostPopularTopicId;

          return (
            <div key={topic.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`font-medium ${isPopular ? "text-primary" : "text-foreground"}`}
                >
                  {topic.label}
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

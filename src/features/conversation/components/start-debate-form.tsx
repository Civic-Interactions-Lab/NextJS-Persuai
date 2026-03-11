"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/logo";
import { Topic, TopicId } from "../../../../convex/types/convexTypes";

interface StartDebateFormProps {
  topics: Topic[] | undefined;
  onStart: (topicId: TopicId, stance: string) => void;
}

const StartDebateForm = ({ topics, onStart }: StartDebateFormProps) => {
  const [selectedTopicId, setSelectedTopicId] = useState<TopicId | null>(null);
  const [userStance, setUserStance] = useState("");

  const selectedTopic = topics?.find((t) => t._id === selectedTopicId);

  return (
    <div className="flex items-start justify-center pt-[20vh]">
      <div className="w-full max-w-2xl px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Logo size={30} />
          </div>
          <p className="text-muted-foreground">
            Choose a topic to start your debate
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic-select">Debate Topic</Label>
            <Select
              value={selectedTopicId ?? ""}
              onValueChange={(val) => {
                setSelectedTopicId(val as TopicId);
                setUserStance("");
              }}
            >
              <SelectTrigger id="topic-select">
                <SelectValue placeholder="Choose a debate topic..." />
              </SelectTrigger>
              <SelectContent>
                {topics?.map((topic) => (
                  <SelectItem key={topic._id} value={topic._id}>
                    {topic.issue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTopic && (
              <p className="text-sm text-muted-foreground">
                {selectedTopic.context}
              </p>
            )}
          </div>

          {selectedTopic && (
            <div className="space-y-2">
              <Label htmlFor="user-stance">Your Opening Statement</Label>
              <Textarea
                id="user-stance"
                value={userStance}
                onChange={(e) => setUserStance(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (selectedTopicId && userStance.trim()) {
                      onStart(selectedTopicId, userStance.trim());
                    }
                  }
                }}
                placeholder="Share your initial thoughts or stance on this topic..."
                className="min-h-[100px] resize-none"
              />
            </div>
          )}

          <Button
            onClick={() =>
              selectedTopicId && onStart(selectedTopicId, userStance.trim())
            }
            disabled={!selectedTopicId || !userStance.trim()}
            className="w-full"
          >
            Start Debate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartDebateForm;

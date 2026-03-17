"use client";

import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { TopicId } from "../../../../convex/types/convexTypes";
import { useGetTopicById } from "@/features/settings/hooks/use-topics";
import { LIKERT_LABELS } from "@/features/survey/components/likert-scale";

interface StartDebateFormProps {
  onStart: (topicId: TopicId, issue: string) => void;
  preSelectedTopicId?: TopicId;
  preSelectedStance?: string;
}

const StartDebateForm = ({
  onStart,
  preSelectedTopicId,
  preSelectedStance,
}: StartDebateFormProps) => {
  const selectedTopic = useGetTopicById(preSelectedTopicId ?? null);

  return (
    <div className="flex items-start justify-center pt-[20vh]">
      <div className="w-full max-w-2xl px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Logo size={30} />
          </div>
        </div>

        <div className="space-y-6">
          {selectedTopic && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  Topic
                </p>
                <p className="text-sm sm:text-base font-medium">
                  {selectedTopic.issue}
                </p>
              </div>

              {preSelectedStance && (
                <div className="flex items-center gap-2 pt-1 border-t">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Your stance is{" "}
                    <span className="font-semibold text-foreground">
                      {preSelectedStance} — {LIKERT_LABELS[preSelectedStance]}
                    </span>{" "}
                    towards this topic.
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Start the conversation whenever you&apos;re ready.
          </p>

          <Button
            onClick={() =>
              preSelectedTopicId &&
              selectedTopic &&
              onStart(preSelectedTopicId, selectedTopic.issue)
            }
            disabled={!preSelectedTopicId || !selectedTopic}
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

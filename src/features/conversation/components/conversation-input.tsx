"use client";

import { ThumbsUpIcon, ThumbsDownIcon, MinusCircleIcon } from "lucide-react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import { MessageAgreement } from "../../../../convex/types/convexTypes";

interface ConversationInputProps {
  input: string;
  onChange: (value: string) => void;
  onSubmit: (message: PromptInputMessage) => void;
  isProcessing: boolean;
  hasResponded: boolean;
  agreement: MessageAgreement | undefined;
}

const AgreementBadge = ({ agreement }: { agreement: MessageAgreement }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 text-xs font-medium py-1 px-2 rounded-full w-fit mb-2",
      agreement === "agree" &&
        "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
      agreement === "disagree" &&
        "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
      agreement === "neutral" &&
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
    )}
  >
    {agreement === "agree" && <ThumbsUpIcon className="size-3" />}
    {agreement === "disagree" && <ThumbsDownIcon className="size-3" />}
    {agreement === "neutral" && <MinusCircleIcon className="size-3" />}
    {agreement === "agree"
      ? "You agreed"
      : agreement === "disagree"
        ? "You disagreed"
        : "You're neutral"}
  </span>
);

const ConversationInput = ({
  input,
  onChange,
  onSubmit,
  isProcessing,
  hasResponded,
  agreement,
}: ConversationInputProps) => (
  <div className="p-4 pb-8">
    {hasResponded && agreement && <AgreementBadge agreement={agreement} />}
    <PromptInput onSubmit={onSubmit}>
      <PromptInputBody>
        <PromptInputTextarea
          placeholder={
            hasResponded
              ? "Try to convince the AI..."
              : "Please select your agreement first..."
          }
          onChange={(e) => onChange(e.target.value)}
          value={input}
          disabled={isProcessing || !hasResponded}
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools />
        <PromptInputSubmit disabled={!input || isProcessing} />
      </PromptInputFooter>
    </PromptInput>
  </div>
);

export default ConversationInput;

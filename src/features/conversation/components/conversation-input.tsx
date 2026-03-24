"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import LikertScale from "@/features/survey/components/likert-scale";

interface ConversationInputProps {
  input: string;
  onChange: (value: string) => void;
  onSubmit: (message: PromptInputMessage) => void;
  isProcessing: boolean;
  hasResponded: boolean;
  agreement: number | undefined;
  onAgreement: (value: number) => void;
}

const ConversationInput = ({
  input,
  onChange,
  onSubmit,
  isProcessing,
  hasResponded,
  agreement,
  onAgreement,
}: ConversationInputProps) => (
  <div className="p-4 pb-8">
    <div className="space-y-1 mb-3">
      <p className="text-xs text-muted-foreground">
        Rate your opinion on the AI&apos;s statement before responding:
      </p>
      <LikertScale
        value={agreement !== undefined ? String(agreement) : ""}
        onChange={(val) => onAgreement(Number(val))}
        disabled={isProcessing}
      />
    </div>
    <PromptInput onSubmit={onSubmit}>
      <PromptInputBody>
        <PromptInputTextarea
          placeholder={
            hasResponded
              ? "Try to convince the AI..."
              : "Please rate the AI's statement first..."
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

"use client";

import React, { useEffect, useState } from "react";
import { LoaderIcon } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  ConversationId,
  MessageId,
  TopicId,
} from "../../../../convex/types/convexTypes";
import { useRouter } from "next/navigation";
import {
  useGetConversationById,
  useUpdateConversation,
} from "@/features/conversation/hooks/use-conversations";
import {
  useCreateMessage,
  useGetMessages,
  useUpdateMessageAgreement,
} from "@/features/conversation/hooks/use-messages";
import StartDebateForm from "@/features/conversation/components/start-debate-form";
import ConversationInput from "@/features/conversation/components/conversation-input";
import MessageList from "@/features/conversation/components/message-list";
import { useGetParticipantByExternalId } from "@/features/conversation/hooks/use-participants";

interface ConversationViewProps {
  conversationId: ConversationId;
  topicStance?: string;
}

const ConversationView = ({
  conversationId,
  topicStance,
}: ConversationViewProps) => {
  const router = useRouter();
  const [input, setInput] = useState("");

  const conversation = useGetConversationById(conversationId);
  const externalId =
    typeof window !== "undefined" ? localStorage.getItem("PROLIFIC_PID") : null;

  const participant = useGetParticipantByExternalId(externalId);
  const isLocked =
    participant?.status === "completed" || participant?.status === "partial";

  const createMessage = useCreateMessage();
  const updateConversation = useUpdateConversation();
  const updateMessageAgreement = useUpdateMessageAgreement();

  useEffect(() => {
    if (conversation === null || conversation?.topicId === null)
      router.push("/");
  }, [conversation, router]);

  const messages = useGetMessages(conversationId);
  const isProcessing = messages?.some((msg) => msg.status === "processing");
  const lastAssistantMessage = messages?.findLast(
    (m) => m.role === "assistant" && m.status === "completed",
  );
  const hasResponded = !!lastAssistantMessage?.agreement;

  const handleAgreement = async (
    messageId: MessageId,
    agreement: "agree" | "disagree" | "neutral",
  ) => {
    await updateMessageAgreement({ id: messageId, agreement });
  };

  const handleStartDebate = async (topicId: TopicId, issue: string) => {
    try {
      await updateConversation({ id: conversationId, topicId });
      await createMessage({
        conversationId,
        role: "user",
        content: issue,
        status: "completed",
      });
      const assistantMessageId = await createMessage({
        conversationId,
        role: "assistant",
        content: "",
        status: "processing",
      });
      fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          assistantMessageId,
          message: issue,
        }),
      }).catch((error) => console.error("Error:", error));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim()) return;
    setInput("");
    try {
      await createMessage({
        conversationId,
        role: "user",
        content: message.text.trim(),
        status: "completed",
      });
      const assistantMessageId = await createMessage({
        conversationId,
        role: "assistant",
        content: "",
        status: "processing",
      });
      fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          assistantMessageId,
          message: message.text.trim(),
        }),
      }).catch((error) => console.error("Error:", error));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="relative flex flex-col h-full max-w-3xl mx-auto px-3">
      <Conversation className="flex-1 pt-4">
        <ConversationContent className="hide-scrollbar">
          {messages === undefined ? (
            <div className="flex items-center justify-center pt-[30vh] text-muted-foreground">
              <div className="flex items-center gap-2">
                <LoaderIcon className="size-5 animate-spin" />
                <span>Loading conversation...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <StartDebateForm
              onStart={handleStartDebate}
              preSelectedTopicId={conversation?.topicId}
              preSelectedStance={topicStance}
            />
          ) : (
            <MessageList messages={messages} onAgreement={handleAgreement} />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {messages &&
        messages.length > 0 &&
        (isLocked ? (
          <div className="p-4 pb-8">
            <div className="flex items-center justify-center rounded-lg border bg-muted/50 px-4 py-3 text-xs sm:text-sm text-muted-foreground text-center">
              This conversation has ended.
            </div>
          </div>
        ) : (
          <ConversationInput
            input={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isProcessing={!!isProcessing}
            hasResponded={hasResponded}
            agreement={lastAssistantMessage?.agreement}
          />
        ))}
    </div>
  );
};

export default ConversationView;

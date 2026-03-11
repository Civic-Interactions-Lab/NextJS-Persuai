"use client";

import React, { useEffect, useState } from "react";
import {
  CopyIcon,
  LoaderIcon,
  AlertCircleIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  MinusCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  ConversationId,
  MessageId,
} from "../../../../convex/types/convexTypes";
import { useRouter } from "next/navigation";
import {
  useGetConversationById,
  useUpdateConversation,
} from "@/features/conversation/hooks/use-conversations";
import { useUpdateMessageAgreement } from "@/features/conversation/hooks/use-messages";
import { useGetActiveTopics } from "@/features/settings/hooks/use-topics";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface ConversationViewProps {
  conversationId: ConversationId;
}

const ConversationView = ({ conversationId }: ConversationViewProps) => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<Id<"topics"> | null>(
    null,
  );
  const [userStance, setUserStance] = useState("");

  const conversation = useGetConversationById(conversationId);
  const isComplete = conversation?.status === "complete";

  const topics = useGetActiveTopics();
  const selectedTopic = topics?.find((t) => t._id === selectedTopicId);

  const createMessage = useMutation(api.messages.createMessage);
  const updateConversation = useUpdateConversation();
  const updateMessageAgreement = useUpdateMessageAgreement();

  useEffect(() => {
    if (conversation === null) {
      router.push("/");
    }
  }, [conversation, router]);

  const messages = useQuery(api.messages.getMessages, { conversationId });
  const isProcessing = messages?.some((msg) => msg.status === "processing");

  const handleAgreement = async (
    messageId: MessageId,
    agreement: "agree" | "disagree" | "neutral",
  ) => {
    await updateMessageAgreement({ id: messageId, agreement });
    const agreementText = {
      agree: "I agree.",
      disagree: "I disagree.",
      neutral: "I'm neutral on this.",
    };
    setInput(agreementText[agreement] + " ");
  };

  const handleStartDebate = async () => {
    if (!selectedTopic || !userStance.trim()) return;

    try {
      await updateConversation({
        id: conversationId,
        topicId: selectedTopic._id,
      });

      await createMessage({
        conversationId,
        role: "user",
        content: userStance.trim(),
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
          message: userStance.trim(),
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

  const getAgreementIcon = (agreement?: "agree" | "disagree" | "neutral") => {
    if (!agreement) return null;
    switch (agreement) {
      case "agree":
        return <CheckCircleIcon className="size-6 text-green-600" />;
      case "disagree":
        return <XCircleIcon className="size-6 text-red-600" />;
      case "neutral":
        return <TriangleAlertIcon className="size-6 text-yellow-500" />;
    }
  };

  const getMessageStyling = (agreement?: "agree" | "disagree" | "neutral") => {
    switch (agreement) {
      case "agree":
        return "bg-green-50 border-l-4 border-l-green-400 dark:bg-green-950/20 dark:border-l-green-500";
      case "disagree":
        return "bg-red-50 border-l-4 border-l-red-400 dark:bg-red-950/20 dark:border-l-red-500";
      case "neutral":
        return "bg-yellow-50 border-l-4 border-l-yellow-400 dark:bg-yellow-950/20 dark:border-l-yellow-500";
      default:
        return "";
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
                        setSelectedTopicId(val as Id<"topics">);
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
                      <Label htmlFor="user-stance">
                        Your Opening Statement
                      </Label>
                      <Textarea
                        id="user-stance"
                        value={userStance}
                        onChange={(e) => setUserStance(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleStartDebate();
                          }
                        }}
                        placeholder="Share your initial thoughts or stance on this topic..."
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleStartDebate}
                    disabled={!selectedTopicId || !userStance.trim()}
                    className="w-full"
                  >
                    Start Debate
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <Message
                  key={message._id}
                  from={message.role}
                  className={cn(
                    "relative transition-colors duration-200",
                    getMessageStyling(message.agreement),
                  )}
                >
                  <MessageContent>
                    <div
                      className={cn(
                        "flex items-start justify-between",
                        message.role === "assistant" && "p-3",
                      )}
                    >
                      <div className="flex-1">
                        {message.status === "processing" ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <LoaderIcon className="size-4 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        ) : message.status === "error" ? (
                          <div className="flex items-center gap-2 text-destructive">
                            <AlertCircleIcon className="size-4" />
                            <span>Failed to generate response</span>
                          </div>
                        ) : (
                          <MessageResponse>{message.content}</MessageResponse>
                        )}
                      </div>
                    </div>
                  </MessageContent>
                  {message.role === "assistant" &&
                    message.status === "completed" &&
                    index === messages.length - 1 && (
                      <MessageActions className="justify-end mb-2 mr-2">
                        <MessageAction
                          onClick={() => handleAgreement(message._id, "agree")}
                          label="Agree"
                        >
                          <ThumbsUpIcon className="size-4" />
                        </MessageAction>
                        <MessageAction
                          onClick={() =>
                            handleAgreement(message._id, "disagree")
                          }
                          label="Disagree"
                        >
                          <ThumbsDownIcon className="size-4" />
                        </MessageAction>
                        <MessageAction
                          onClick={() =>
                            handleAgreement(message._id, "neutral")
                          }
                          label="Neutral"
                        >
                          <MinusCircleIcon className="size-4" />
                        </MessageAction>
                        <MessageAction
                          onClick={() =>
                            navigator.clipboard.writeText(message.content)
                          }
                          label="Copy"
                        >
                          <CopyIcon className="size-4" />
                        </MessageAction>
                      </MessageActions>
                    )}
                  {message.role === "assistant" && message.agreement && (
                    <div className="shrink-0 pt-1 absolute -top-3 -right-3">
                      {getAgreementIcon(message.agreement)}
                    </div>
                  )}
                </Message>
              ))}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {messages && messages.length > 0 && (
        <div className="p-4 pb-8">
          {isComplete ? (
            <div className="flex items-center justify-center rounded-lg border bg-muted/50 px-4 py-3 text-xs sm:text-sm text-muted-foreground text-center">
              This conversation has ended.
            </div>
          ) : (
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputTextarea
                  placeholder="Try to convince the AI..."
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  disabled={isProcessing}
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools />
                <PromptInputSubmit disabled={!input || isProcessing} />
              </PromptInputFooter>
            </PromptInput>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationView;

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
import { ConversationId, MessageId } from "../../../../convex/types";
import { useRouter } from "next/navigation";
import { useGetConversationById } from "@/features/conversation/hooks/use-conversations";
import { useUpdateMessageAgreement } from "@/features/conversation/hooks/use-messages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Logo from "@/components/logo";
import { DEBATE_TOPICS } from "@/features/conversation/constants/topics";
import { AI_AGENTS } from "@/features/conversation/constants/ai-agents";
import { cn } from "@/lib/utils";
import { useAccessCodeStore } from "@/features/conversation/stores/access-code-store";

interface ConversationViewProps {
  conversationId: ConversationId;
}

const ConversationView = ({ conversationId }: ConversationViewProps) => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [manuallyVerified, setManuallyVerified] = useState(false);

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const { accessCode: storedAccessCode, setAccessCode: saveAccessCode } =
    useAccessCodeStore();

  const conversation = useGetConversationById(conversationId);
  const createMessage = useMutation(api.messages.createMessage);
  const updateTopicAndAgent = useMutation(
    api.conversations.updateTopicAndAgent,
  );
  const updateMessageAgreement = useUpdateMessageAgreement();

  // Compute isVerified instead of storing it in state
  const isVerified =
    manuallyVerified ||
    (conversation &&
      storedAccessCode &&
      storedAccessCode.toUpperCase() === conversation.uid);

  useEffect(() => {
    if (conversation === null) {
      router.push("/");
    }
  }, [conversation, router]);

  const messages = useQuery(api.messages.getMessages, { conversationId });
  const isProcessing = messages?.some((msg) => msg.status === "processing");

  const selectedTopic = DEBATE_TOPICS.find((t) => t.id === selectedTopicId);
  const selectedAgent = AI_AGENTS.find((a) => a.id === selectedAgentId);

  const handleVerify = () => {
    if (!conversation) return;

    if (accessCode.toUpperCase() === conversation.uid) {
      setManuallyVerified(true);
      setVerifyError("");
      // Save access code to Zustand
      saveAccessCode(accessCode.toUpperCase());
    } else {
      setVerifyError("Invalid access code. Please try again.");
    }
  };

  const handleAgreement = async (
    messageId: MessageId,
    agreement: "agree" | "disagree" | "neutral",
  ) => {
    await updateMessageAgreement({ id: messageId, agreement });

    // Populate input with agreement text
    const agreementText = {
      agree: "I agree.",
      disagree: "I disagree.",
      neutral: "I'm neutral on this.",
    };
    setInput(agreementText[agreement] + " ");
  };

  const handleStartDebate = async () => {
    if (!selectedTopic || !selectedAgent) return;

    try {
      await updateTopicAndAgent({
        id: conversationId,
        topic: selectedTopic.id,
        topicPrompt: selectedTopic.prompt,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        agentPosition: selectedAgent.position,
      });

      await createMessage({
        conversationId,
        role: "user",
        content: selectedTopic.prompt,
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          assistantMessageId,
          message: selectedTopic.prompt,
        }),
      }).catch((error) => {
        console.error("Error:", error);
      });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          assistantMessageId,
          message: message.text.trim(),
        }),
      }).catch((error) => {
        console.error("Error:", error);
      });
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
    if (!agreement) return null;

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
    <div className="relative flex flex-col h-full max-w-3xl mx-auto">
      {/* Access Code Overlay */}
      {!isVerified && conversation && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-[30vh] bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 space-y-6 rounded-lg border bg-card p-8 shadow-lg">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Enter Access Code
              </h2>
              <p className="text-sm text-muted-foreground">
                Please enter your 5-character access code to continue
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter code (e.g., ABC12)"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value.toUpperCase());
                    setVerifyError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleVerify();
                    }
                  }}
                  maxLength={5}
                  className="text-center text-lg font-mono tracking-widest uppercase"
                  autoFocus
                />
                {verifyError && (
                  <p className="text-sm text-destructive text-center">
                    {verifyError}
                  </p>
                )}
              </div>

              <Button onClick={handleVerify} className="w-full">
                Verify Code
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Conversation Content */}
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
                    Choose a topic and AI agent to start your debate
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="topic-select">Debate Topic</Label>
                    <Select
                      value={selectedTopicId || ""}
                      onValueChange={setSelectedTopicId}
                    >
                      <SelectTrigger id="topic-select">
                        <SelectValue placeholder="Choose a debate topic..." />
                      </SelectTrigger>
                      <SelectContent>
                        {DEBATE_TOPICS.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTopic && (
                      <p className="text-sm text-muted-foreground">
                        {selectedTopic.prompt}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>AI Agent</Label>
                    <RadioGroup
                      value={selectedAgentId || ""}
                      onValueChange={setSelectedAgentId}
                      className="space-y-3"
                    >
                      {AI_AGENTS.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer hover:bg-accent"
                          onClick={() => setSelectedAgentId(agent.id)}
                        >
                          <RadioGroupItem value={agent.id} id={agent.id} />
                          <div className="flex-1 space-y-1">
                            <Label
                              htmlFor={agent.id}
                              className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                            >
                              {agent.name}
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  agent.position === "agree"
                                    ? "bg-green-100 text-green-700"
                                    : agent.position === "disagree"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {agent.position}
                              </span>
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {agent.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button
                    onClick={handleStartDebate}
                    disabled={!selectedTopicId || !selectedAgentId}
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
                    message.status === "completed" && (
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
                        {index === messages.length - 1 && (
                          <MessageAction
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                            }}
                            label="Copy"
                          >
                            <CopyIcon className="size-4" />
                          </MessageAction>
                        )}
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
        </div>
      )}
    </div>
  );
};

export default ConversationView;

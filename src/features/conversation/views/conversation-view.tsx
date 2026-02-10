"use client";

import React, { useEffect, useState } from "react";
import { CopyIcon, LoaderIcon, AlertCircleIcon } from "lucide-react";
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
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types";
import { useRouter } from "next/navigation";
import { useGetConversationById } from "@/features/conversation/hooks/use-conversations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";

interface ConversationViewProps {
  conversationId: ConversationId;
}

const ConversationView = ({ conversationId }: ConversationViewProps) => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [verifyError, setVerifyError] = useState("");

  const conversation = useGetConversationById(conversationId);

  const createMessage = useMutation(api.messages.createMessage);

  useEffect(() => {
    if (conversation === null) {
      router.push("/");
    }
  }, [conversation, router]);

  const messages = useQuery(api.messages.getMessages, { conversationId });

  const isProcessing = messages?.some((msg) => msg.status === "processing");

  const handleVerify = () => {
    if (!conversation) return;

    if (accessCode.toUpperCase() === conversation.uid) {
      setIsVerified(true);
      setVerifyError("");
    } else {
      setVerifyError("Invalid access code. Please try again.");
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim()) return;

    setInput("");

    try {
      // Create user message with status completed
      await createMessage({
        conversationId,
        role: "user",
        content: message.text.trim(),
        status: "completed",
      });

      // Create assistant message with status processing
      const assistantMessageId = await createMessage({
        conversationId,
        role: "assistant",
        content: "",
        status: "processing",
      });

      // Send request to generate AI response in background
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

  return (
    <div className="relative flex flex-col h-full max-w-4xl mx-auto">
      {/* Access Code Overlay */}
      {!isVerified && conversation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
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
      <Conversation className="flex-1">
        <ConversationContent className="hide-scrollbar">
          {messages === undefined ? (
            <div className="flex items-center justify-center pt-[30vh] text-muted-foreground">
              <div className="flex items-center gap-2">
                <LoaderIcon className="size-5 animate-spin" />
                <span>Loading conversation...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center pt-[30vh] text-muted-foreground">
              <div className="text-center space-y-2">
                <Logo size={32} />
                <p>Start a conversation to persuade the AI</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <Message key={message._id} from={message.role}>
                  <MessageContent>
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
                  </MessageContent>
                  {message.role === "assistant" &&
                    message.status === "completed" &&
                    index === messages.length - 1 && (
                      <MessageActions>
                        <MessageAction
                          onClick={() => {
                            navigator.clipboard.writeText(message.content);
                          }}
                          label="Copy"
                        >
                          <CopyIcon className="size-3" />
                        </MessageAction>
                      </MessageActions>
                    )}
                </Message>
              ))}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

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
    </div>
  );
};

export default ConversationView;

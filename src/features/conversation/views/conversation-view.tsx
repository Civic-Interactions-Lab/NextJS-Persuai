"use client";

import React, { useState } from "react";
import { CopyIcon, LoaderIcon } from "lucide-react";

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

type MessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "processing" | "completed";
};

const ConversationView = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim()) return;

    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: "user",
      content: message.text,
      status: "completed",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Add assistant processing message
    const assistantMessage: MessageType = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      status: "processing",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Call the API
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Update assistant message with response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: data.response,
                status: "completed" as const,
              }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Error:", error);
      // Update with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: "Sorry, something went wrong. Please try again.",
                status: "completed" as const,
              }
            : msg,
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <Conversation className="flex-1">
        <ConversationContent className="hide-scrollbar">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground max-w-150 mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">
                  <span className="text-black">PERSU</span>
                  <span className="text-gray-600">AI</span>
                </h2>
                <p>Start a conversation to persuade the AI</p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.status === "processing" ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LoaderIcon className="size-4 animate-spin" />
                    <span>Thinking...</span>
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

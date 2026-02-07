"use client";

import React, { useState, useEffect } from "react";
import { CopyIcon, LoaderIcon } from "lucide-react";
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
import { ConversationId } from "../../../../convex/types";
import { api } from "../../../../convex/_generated/api";

const ConversationView = () => {
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<ConversationId | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const createConversation = useMutation(api.conversations.createConversation);
  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip",
  );

  // Create conversation on mount
  useEffect(() => {
    createConversation({ userId: "guest" }).then(setConversationId);
  }, [createConversation]);

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim() || !conversationId) return;

    setInput("");
    setIsProcessing(true);

    try {
      await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          message: message.text,
        }),
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <Conversation className="flex-1">
        <ConversationContent className="hide-scrollbar">
          {!messages || messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">
                  <span className="text-black">PERSU</span>
                  <span className="text-gray-600">AI</span>
                </h2>
                <p>Start a conversation to persuade the AI</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <Message key={message._id} from={message.role}>
                  <MessageContent>
                    <MessageResponse>{message.content}</MessageResponse>
                  </MessageContent>
                  {message.role === "assistant" &&
                    index === messages.length - 1 &&
                    !isProcessing && (
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
              {isProcessing && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <LoaderIcon className="size-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </MessageContent>
                </Message>
              )}
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

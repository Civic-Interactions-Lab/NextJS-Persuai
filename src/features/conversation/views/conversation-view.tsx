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

interface ConversationViewProps {
  conversationId: ConversationId;
}

const ConversationView = ({ conversationId }: ConversationViewProps) => {
  const router = useRouter();
  const [input, setInput] = useState("");

  const conversation = useQuery(api.conversations.getConversationById, {
    id: conversationId,
  });

  const createMessage = useMutation(api.messages.createMessage);

  useEffect(() => {
    if (conversation === null) {
      router.push("/");
    }
  }, [conversation, router]);

  const messages = useQuery(api.messages.getMessages, { conversationId });

  const isProcessing = messages?.some((msg) => msg.status === "processing");

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
    <div className="flex flex-col h-full max-w-4xl mx-auto">
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

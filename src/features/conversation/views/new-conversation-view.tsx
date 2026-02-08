"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderIcon } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  message: z.string().min(1),
});

const NewConversationView = () => {
  const router = useRouter();
  const createConversation = useMutation(api.conversations.createConversation);
  const createMessage = useMutation(api.messages.createMessage);

  const form = useForm({
    defaultValues: {
      message: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      // Create conversation
      const conversationId = await createConversation({
        userId: "guest",
        title: "New Conversation",
        topic: "",
      });

      // Create user message with status completed
      await createMessage({
        conversationId,
        role: "user",
        content: value.message.trim(),
        status: "completed",
      });

      // Create assistant message with status processing
      const assistantMessageId = await createMessage({
        conversationId,
        role: "assistant",
        content: "",
        status: "processing",
      });

      // Navigate immediately
      router.push(`/${conversationId}`);

      // Send request to generate AI response in background
      fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          assistantMessageId,
          message: value.message.trim(),
        }),
      }).catch((error) => {
        console.error("Error sending message:", error);
      });
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit();
    }
  };

  return (
    <div className="flex items-start justify-center h-full pt-[30vh]">
      <div className="w-full max-w-2xl px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Image src="/logo.svg" alt="PersuAI logo" width={30} height={30} />
            <h1 className="text-3xl font-bold tracking-wider">
              <span className="text-black">PERSU</span>
              <span className="text-gray-400">AI</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Start a conversation to persuade the AI
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="message">
            {(field) => (
              <Textarea
                placeholder="What topic would you like to debate?"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                onKeyDown={handleKeyDown}
                className="min-h-30 resize-none"
              />
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <LoaderIcon className="size-4 animate-spin mr-2" />
                    Starting conversation...
                  </>
                ) : (
                  "Start Debate"
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
};

export default NewConversationView;

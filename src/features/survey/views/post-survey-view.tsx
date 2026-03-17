"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useSubmitSurvey,
  useGetSurveyResponsesByExternalId,
} from "@/features/survey/hooks/use-surveys";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { POST_SURVEY_QUESTIONS } from "@/features/survey/constants/post-survey-questions";
import { ConversationId } from "../../../../convex/types/convexTypes";
import { useGetConversationById } from "@/features/conversation/hooks/use-conversations";
import { useGetTopicById } from "@/features/admin/settings/hooks/use-topics";
import LikertScale from "@/features/survey/components/likert-scale";
import { useGetMessages } from "@/features/conversation/hooks/use-messages";
import { useUpsertParticipant } from "@/features/conversation/hooks/use-participants";
import { ROUND_COUNT } from "@/features/conversation/constants/ai-agents";
import { generateSubmissionCode } from "@/lib/utils";

const formSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  aiTrust: z.string().min(1, "Required"),
  aiPotential: z.string().min(1, "Required"),
  topicStance: z.string().min(1, "Required"),
});

export type PostSurveyFormData = z.infer<typeof formSchema>;

const PostSurveyView = ({
  conversationId,
}: {
  conversationId: ConversationId;
}) => {
  const router = useRouter();
  const submitSurvey = useSubmitSurvey();
  const upsertParticipant = useUpsertParticipant();
  const conversation = useGetConversationById(conversationId);
  const topic = useGetTopicById(conversation?.topicId ?? null);
  const messages = useGetMessages(conversationId);

  const externalId =
    typeof window !== "undefined" ? localStorage.getItem("PROLIFIC_PID") : null;

  const surveyResponses = useGetSurveyResponsesByExternalId(externalId);
  const existingPostSurvey = surveyResponses?.find((r) => r.type === "post");
  const isReadOnly = !!existingPostSurvey;

  const form = useForm<PostSurveyFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participantId: "",
      aiTrust: "",
      aiPotential: "",
      topicStance: "",
    },
  });

  useEffect(() => {
    const pid = localStorage.getItem("PROLIFIC_PID");
    if (pid) form.setValue("participantId", pid);
  }, [form]);

  useEffect(() => {
    if (existingPostSurvey) {
      existingPostSurvey.answers.forEach(({ questionId, value }) => {
        form.setValue(questionId as keyof PostSurveyFormData, value);
      });
    }
  }, [existingPostSurvey, form]);

  const onSubmit = async (data: PostSurveyFormData) => {
    try {
      const externalId =
        localStorage.getItem("PROLIFIC_PID") ?? crypto.randomUUID();

      await submitSurvey({
        conversationId,
        externalId,
        type: "post",
        answers: [
          ...Object.entries(data)
            .filter(([, value]) => value !== "" && value !== undefined)
            .map(([questionId, value]) => ({
              questionId,
              value: value as string,
            })),
          ...(conversation?.topicId
            ? [{ questionId: "topicId", value: conversation.topicId }]
            : []),
        ],
      });

      const userMessageCount =
        messages?.filter((m) => m.role === "user").length ?? 0;
      const status = userMessageCount < ROUND_COUNT ? "partial" : "completed";
      const submissionCode = generateSubmissionCode();

      await upsertParticipant({ externalId, status, submissionCode });

      router.replace("/debriefing");
    } catch (error) {
      console.error("Failed to submit survey:", error);
      toast.error("Failed to submit survey. Please try again.");
    }
  };

  const q = POST_SURVEY_QUESTIONS;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-4 sm:mb-8 space-y-2 sm:space-y-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Post-Activity Survey
          </h1>
          {isReadOnly ? (
            <p className="text-sm text-muted-foreground">
              You have already submitted this survey. Your responses are shown
              below.
            </p>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Please answer a few questions about your experience.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                There will be no personal information collected in this survey,
                and your responses will be de-identified.
              </p>
            </>
          )}
        </div>

        {!isReadOnly && (
          <p className="mb-3 text-xs sm:text-sm text-muted-foreground text-end">
            <span className="text-destructive">(*)</span> required
          </p>
        )}

        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-4 sm:p-6 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 sm:space-y-8"
              >
                <FormField
                  control={form.control}
                  name="participantId"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aiTrust"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        {q.aiTrust.label}
                        {!isReadOnly && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <LikertScale
                          value={field.value}
                          onChange={field.onChange}
                          min={q.aiTrust.min}
                          max={q.aiTrust.max}
                          minLabel={q.aiTrust.minLabel}
                          maxLabel={q.aiTrust.maxLabel}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aiPotential"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        {q.aiPotential.label}
                        {!isReadOnly && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <LikertScale
                          value={field.value}
                          onChange={field.onChange}
                          min={q.aiPotential.min}
                          max={q.aiPotential.max}
                          minLabel={q.aiPotential.minLabel}
                          maxLabel={q.aiPotential.maxLabel}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(topic || isReadOnly) && (
                  <>
                    <div className="space-y-1 sm:space-y-2 pt-2 border-t">
                      <p className="text-sm sm:text-base font-medium pt-3 sm:pt-4">
                        {isReadOnly
                          ? "Your agreement with your debate topic after the discussion."
                          : "Rate your agreement with your debate topic after the discussion."}
                      </p>
                      {!isReadOnly && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Scale: 1 = Strongly Disagree, 7 = Strongly Agree
                        </p>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="topicStance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">
                            {topic?.issue}
                            {!isReadOnly && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <LikertScale
                              value={field.value}
                              onChange={field.onChange}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {!isReadOnly && (
                  <div className="pt-4 flex justify-center">
                    <Button
                      type="submit"
                      className="w-full md:max-w-sm h-10 sm:h-11 text-sm sm:text-base"
                      disabled={form.formState.isSubmitting || !topic}
                    >
                      {form.formState.isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <LoaderIcon className="size-4 animate-spin" />
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>

        {!isReadOnly && (
          <p className="my-4 sm:my-6 text-xs sm:text-sm text-muted-foreground text-center">
            Please make sure you complete all the required fields. Thank you!
          </p>
        )}
      </div>
    </div>
  );
};

export default PostSurveyView;

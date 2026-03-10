"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitSurvey } from "@/features/survey/hooks/use-surveys";
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
import { cn } from "@/lib/utils";
import { Id } from "../../../../convex/_generated/dataModel";
import { useCompleteConversation } from "@/features/conversation/hooks/use-conversations";

const formSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  aiTrust: z.string().min(1, "Required"),
  aiPotential: z.string().min(1, "Required"),
  topic1L: z.string().min(1, "Required"),
  topic1R: z.string().min(1, "Required"),
  topic2L: z.string().min(1, "Required"),
  topic2R: z.string().min(1, "Required"),
  topic3L: z.string().min(1, "Required"),
  topic3R: z.string().min(1, "Required"),
  topic4L: z.string().min(1, "Required"),
  topic4R: z.string().min(1, "Required"),
});

export type PostSurveyFormData = z.infer<typeof formSchema>;

const LikertScale = ({
  value,
  onChange,
  min,
  max,
  minLabel,
  maxLabel,
}: {
  value: string;
  onChange: (val: string) => void;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}) => {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="py-2 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 hidden sm:block w-16 text-right">
          {minLabel}
        </span>
        <div className="flex flex-1 justify-between">
          {steps.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChange(String(step))}
              className={cn(
                "size-7 sm:size-9 rounded-full border-2 text-xs sm:text-sm font-medium transition-colors",
                value === String(step)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent border-input",
              )}
            >
              {step}
            </button>
          ))}
        </div>
        <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 hidden sm:block w-16 text-left">
          {maxLabel}
        </span>
      </div>
      <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground sm:hidden">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};

const PostSurveyView = ({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) => {
  const router = useRouter();
  const submitSurvey = useSubmitSurvey();
  const completeConversation = useCompleteConversation();

  const form = useForm<PostSurveyFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participantId: "",
      aiTrust: "",
      aiPotential: "",
      topic1L: "",
      topic1R: "",
      topic2L: "",
      topic2R: "",
      topic3L: "",
      topic3R: "",
      topic4L: "",
      topic4R: "",
    },
  });

  useEffect(() => {
    const pid = localStorage.getItem("PROLIFIC_PID");
    if (pid) form.setValue("participantId", pid);
  }, [form]);

  const onSubmit = async (data: PostSurveyFormData) => {
    try {
      const externalId =
        localStorage.getItem("PROLIFIC_PID") ?? crypto.randomUUID();

      await submitSurvey({
        conversationId,
        externalId,
        type: "post",
        answers: Object.entries(data)
          .filter(([, value]) => value !== "" && value !== undefined)
          .map(([questionId, value]) => ({
            questionId,
            value: value as string,
          })),
      });

      await completeConversation({ id: conversationId });
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
          <p className="text-xs sm:text-sm text-muted-foreground">
            Welcome! In this section, you will be asked 2 questions about the
            trust and potential of AI in question answering.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            There will be no personal information collected in this survey, and
            your responses will be de-identified.
          </p>
        </div>

        <p className="mb-3 text-xs sm:text-sm text-muted-foreground text-end">
          <span className="text-destructive">(*)</span> required
        </p>

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

                {/* AI Trust */}
                <FormField
                  control={form.control}
                  name="aiTrust"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        {q.aiTrust.label}
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <LikertScale
                          value={field.value}
                          onChange={field.onChange}
                          min={q.aiTrust.min}
                          max={q.aiTrust.max}
                          minLabel={q.aiTrust.minLabel}
                          maxLabel={q.aiTrust.maxLabel}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* AI Potential */}
                <FormField
                  control={form.control}
                  name="aiPotential"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        {q.aiPotential.label}
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <LikertScale
                          value={field.value}
                          onChange={field.onChange}
                          min={q.aiPotential.min}
                          max={q.aiPotential.max}
                          minLabel={q.aiPotential.minLabel}
                          maxLabel={q.aiPotential.maxLabel}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Topic Questions */}
                <div className="space-y-1 sm:space-y-2 pt-2 border-t">
                  <p className="text-sm sm:text-base font-medium pt-3 sm:pt-4">
                    Please rate your agreement with the following topics after
                    your discussion.
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Scale: 1 = Strongly Agree, 7 = Strongly Disagree
                  </p>
                </div>

                {(
                  [
                    "topic1L",
                    "topic1R",
                    "topic2L",
                    "topic2R",
                    "topic3L",
                    "topic3R",
                    "topic4L",
                    "topic4R",
                  ] as const
                ).map((key) => {
                  const question = q[key];
                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      name={key}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">
                            {question.label}
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            How do you agree or disagree with this topic?
                          </p>
                          <FormControl>
                            <LikertScale
                              value={field.value}
                              onChange={field.onChange}
                              min={question.min}
                              max={question.max}
                              minLabel={question.minLabel}
                              maxLabel={question.maxLabel}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}

                <div className="pt-4 flex justify-center">
                  <Button
                    type="submit"
                    className="w-full md:max-w-sm h-10 sm:h-11 text-sm sm:text-base"
                    disabled={form.formState.isSubmitting}
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
              </form>
            </Form>
          </div>
        </div>

        <p className="my-4 sm:my-6 text-xs sm:text-sm text-muted-foreground text-center">
          Please make sure you complete all the required fields. Thank you!
        </p>
      </div>
    </div>
  );
};

export default PostSurveyView;

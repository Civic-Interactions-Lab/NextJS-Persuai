"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateConversation } from "@/features/conversation/hooks/use-conversations";
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { PRE_SURVEY_QUESTIONS } from "@/features/survey/constants/pre-survey-questions";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  aiTrust: z.string().min(1, "Required"),
  aiPotential: z.string().min(1, "Required"),
  politicalOrientation: z.string().optional(),
  topic1L: z.string().min(1, "Required"),
  topic1R: z.string().min(1, "Required"),
  topic2L: z.string().min(1, "Required"),
  topic2R: z.string().min(1, "Required"),
  topic3L: z.string().min(1, "Required"),
  topic3R: z.string().min(1, "Required"),
  topic4L: z.string().min(1, "Required"),
  topic4R: z.string().min(1, "Required"),
});

export type PreSurveyFormData = z.infer<typeof formSchema>;

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
        <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 w-16 text-right">
          {minLabel}
        </span>
        <div className="flex flex-1 justify-between lg:px-6">
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
        <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 w-16 text-left">
          {maxLabel}
        </span>
      </div>
    </div>
  );
};

const PreSurveyView = () => {
  const router = useRouter();
  const createConversation = useCreateConversation();
  const submitSurvey = useSubmitSurvey();

  const form = useForm<PreSurveyFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participantId: "",
      aiTrust: "",
      aiPotential: "",
      politicalOrientation: "",
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
    const pid = localStorage.getItem("PROLIFIC_PID") ?? crypto.randomUUID();
    form.setValue("participantId", pid);
  }, [form]);

  const onSubmit = async (data: PreSurveyFormData) => {
    try {
      const externalId =
        localStorage.getItem("PROLIFIC_PID") ?? crypto.randomUUID();
      const externalStudyId = localStorage.getItem("STUDY_ID") ?? undefined;
      const externalSessionId = localStorage.getItem("SESSION_ID") ?? undefined;

      const conversationId = await createConversation({
        externalId,
        externalStudyId,
        externalSessionId,
        title: "New Conversation",
      });

      await submitSurvey({
        conversationId,
        externalId,
        type: "pre",
        answers: Object.entries(data)
          .filter(([, value]) => value !== "" && value !== undefined)
          .map(([questionId, value]) => ({
            questionId,
            value: value as string,
          })),
      });

      router.replace(`/conversations/${conversationId}`);
    } catch (error) {
      console.error("Failed to submit survey:", error);
      toast.error("Failed to submit survey. Please try again.");
    }
  };

  const q = PRE_SURVEY_QUESTIONS;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-4 sm:mb-8 space-y-2 sm:space-y-3">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Pre-Activity Survey
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome! In this section, you will be asked 2 questions about the
            trust and potential of AI in question answering. Please choose one
            starter topic below.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground">
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
                {/* Participant ID - auto-filled, disabled */}
                <FormField
                  control={form.control}
                  name="participantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        Participant ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className="h-10 sm:h-11 text-sm sm:text-base bg-muted cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
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

                {/* Political Orientation */}
                <FormField
                  control={form.control}
                  name="politicalOrientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        {q.politicalOrientation.label}
                        <span className="text-muted-foreground ml-1 text-xs sm:text-sm">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col pt-2"
                        >
                          {q.politicalOrientation.options.map((option) => (
                            <FormItem
                              key={option.value}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={option.value} />
                              </FormControl>
                              <FormLabel className="text-xs sm:text-sm font-normal cursor-pointer">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Topic Questions */}
                <div className="space-y-1 sm:space-y-2 pt-2 border-t">
                  <p className="text-sm sm:text-base font-medium pt-3 sm:pt-4">
                    Please rate your agreement with the following topics. You
                    will be engaging in a discussion for 30 rounds based on the
                    topic you pick.
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
                          <FormLabel className="text-sm sm:text-base mt-2">
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

                <div className="pt-6 flex justify-center">
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
                      "Submit Survey"
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

export default PreSurveyView;

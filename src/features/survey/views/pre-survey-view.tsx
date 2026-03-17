"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateConversation } from "@/features/conversation/hooks/use-conversations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { PRE_SURVEY_QUESTIONS } from "@/features/survey/constants/pre-survey-questions";
import { TopicId } from "../../../../convex/types/convexTypes";
import { useGetTopics } from "@/features/admin/settings/hooks/use-topics";
import LikertScale from "@/features/survey/components/likert-scale";
import {
  INITIAL_TITLE,
  ROUND_COUNT,
} from "@/features/conversation/constants/ai-agents";
import { useUpsertParticipant } from "@/features/conversation/hooks/use-participants";

const formSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  aiTrust: z.string().min(1, "Required"),
  aiPotential: z.string().min(1, "Required"),
  politicalOrientation: z.string().optional(),
  selectedTopicId: z.string().min(1, "Please select a topic"),
  topicStance: z
    .string()
    .min(1, "Please rate your stance on the selected topic"),
});

export type PreSurveyFormData = z.infer<typeof formSchema>;

const PreSurveyView = () => {
  const router = useRouter();
  const createConversation = useCreateConversation();
  const submitSurvey = useSubmitSurvey();
  const topics = useGetTopics();
  const upsertParticipant = useUpsertParticipant();

  const externalId =
    typeof window !== "undefined" ? localStorage.getItem("PROLIFIC_PID") : null;

  const surveyResponses = useGetSurveyResponsesByExternalId(externalId);
  const existingPreSurvey = surveyResponses?.find((r) => r.type === "pre");
  const isReadOnly = !!existingPreSurvey;

  const form = useForm<PreSurveyFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participantId: "",
      aiTrust: "",
      aiPotential: "",
      politicalOrientation: "",
      selectedTopicId: "",
      topicStance: "",
    },
  });

  useEffect(() => {
    const pid = localStorage.getItem("PROLIFIC_PID") ?? crypto.randomUUID();
    form.setValue("participantId", pid);
  }, [form]);

  useEffect(() => {
    if (existingPreSurvey) {
      existingPreSurvey.answers.forEach(({ questionId, value }) => {
        form.setValue(questionId as keyof PreSurveyFormData, value);
      });
    }
  }, [existingPreSurvey, form]);

  const selectedTopicId = form.watch("selectedTopicId");
  const selectedTopic = topics?.find((t) => t._id === selectedTopicId);

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
        title: INITIAL_TITLE,
        topicId: data.selectedTopicId as TopicId,
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

      await upsertParticipant({ externalId, status: "active" });

      router.replace(
        `/conversations/${conversationId}?stance=${data.topicStance}`,
      );
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
          {isReadOnly ? (
            <p className="text-sm text-muted-foreground">
              You have already submitted this survey. Your responses are shown
              below.
            </p>
          ) : (
            <>
              <p className="text-sm sm:text-base text-muted-foreground">
                Welcome! Please answer 2 questions about AI and then pick one
                topic you will be debating.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground">
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
          <div className="p-2 sm:p-4 md:p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 sm:space-y-8"
              >
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

                <FormField
                  control={form.control}
                  name="politicalOrientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        {q.politicalOrientation.label}
                        {!isReadOnly && (
                          <span className="text-muted-foreground ml-1 text-xs sm:text-sm">
                            (optional)
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={
                            isReadOnly ? undefined : field.onChange
                          }
                          value={field.value}
                          className="flex flex-col pt-2"
                        >
                          {q.politicalOrientation.options.map((option) => (
                            <FormItem
                              key={option.value}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={option.value}
                                  disabled={isReadOnly}
                                />
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

                <div className="space-y-1 sm:space-y-2 pt-2 border-t">
                  <p className="text-sm sm:text-base font-medium pt-3 sm:pt-4">
                    {isReadOnly
                      ? "Your selected debate topic."
                      : `Pick one topic you will be debating for ${ROUND_COUNT} rounds.`}
                  </p>
                  {!isReadOnly && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      After selecting a topic, rate your initial agreement (1 =
                      Strongly Disagree, 7 = Strongly Agree).
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="selectedTopicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        Select a Debate Topic
                        {!isReadOnly && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={
                          isReadOnly
                            ? undefined
                            : (val) => {
                                field.onChange(val);
                                form.setValue("topicStance", "");
                              }
                        }
                        disabled={isReadOnly}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 sm:h-11 w-full overflow-hidden">
                            <SelectValue
                              placeholder="Choose a debate topic..."
                              className="truncate"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {topics?.map((topic) => (
                            <SelectItem key={topic._id} value={topic._id}>
                              {topic.issue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(selectedTopic || isReadOnly) && (
                  <FormField
                    control={form.control}
                    name="topicStance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">
                          How much do you agree with this topic?
                          {!isReadOnly && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </FormLabel>
                        {!isReadOnly && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Scale: 1 = Strongly Disagree, 7 = Strongly Agree
                          </p>
                        )}
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
                )}

                {!isReadOnly && (
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

export default PreSurveyView;

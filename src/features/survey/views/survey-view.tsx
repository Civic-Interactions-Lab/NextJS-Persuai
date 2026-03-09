"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { surveyQuestions } from "@/features/survey/constants/survey-questions";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";
import { LoaderIcon } from "lucide-react";

const PRE_SURVEY_ID = "jh77ef4vr6sj5kbktg64wp3jy982gt4y" as Id<"surveys">;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  background: z.string().min(1, "Please select your background"),
  experience: z.string().min(1, "Please select your experience level"),
});

type FormData = z.infer<typeof formSchema>;

const SurveyView = () => {
  const router = useRouter();
  const createConversation = useCreateConversation();
  const submitSurvey = useSubmitSurvey();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      background: "",
      experience: "",
    },
  });

  const onSubmit = async (data: FormData) => {
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
        surveyId: PRE_SURVEY_ID,
        conversationId,
        externalId,
        type: "pre",
        answers: Object.entries(data).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      });

      router.push(`/conversations/${conversationId}`);
    } catch (error) {
      console.error("Failed to submit survey:", error);
      toast.error("Failed to submit survey. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-8 lg:px-4 py-6">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Survey</h1>
          <p className="text-muted-foreground">
            Please complete this brief survey before starting your conversation.
            This helps us provide you with a personalized experience.
          </p>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {surveyQuestions.map((question) => (
                  <FormField
                    key={question.name}
                    control={form.control}
                    name={question.name as keyof FormData}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {question.label}
                          {question.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </FormLabel>

                        {question.type === "text" && (
                          <FormControl>
                            <Input
                              placeholder={question.placeholder}
                              {...field}
                              className="h-11"
                            />
                          </FormControl>
                        )}

                        {question.type === "radio" && (
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-3 pt-2"
                            >
                              {question.options?.map((option) => (
                                <FormItem
                                  key={option}
                                  className="flex items-center space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <RadioGroupItem value={option} />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {option}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        )}

                        {question.type === "select" && (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue
                                  placeholder={question.placeholder}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {question.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-11"
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

        <p className="mt-6 text-sm text-muted-foreground text-center">
          All fields marked with <span className="text-destructive">*</span> are
          required
        </p>
      </div>
    </div>
  );
};

export default SurveyView;

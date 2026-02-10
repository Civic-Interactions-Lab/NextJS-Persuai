"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const surveyQuestions = [
  {
    name: "name",
    label: "What is your name?",
    type: "text",
    placeholder: "Enter your name",
    required: true,
  },
  {
    name: "background",
    label: "What is your background?",
    type: "radio",
    required: true,
    options: ["Computer Science", "Engineering", "Business", "Design", "Other"],
  },
  {
    name: "experience",
    label: "How many years of experience do you have?",
    type: "select",
    placeholder: "Select your experience level",
    required: true,
    options: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"],
  },
] as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  background: z.string().min(1, "Please select your background"),
  experience: z.string().min(1, "Please select your experience level"),
});

type FormData = z.infer<typeof formSchema>;

const SurveyView = () => {
  const router = useRouter();
  const submitSurvey = useSubmitSurvey();
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionData, setCompletionData] = useState<{
    uid: string;
    conversationId: string;
  } | null>(null);

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
      const responses = JSON.stringify(data);

      const { uid, conversationId } = await submitSurvey({
        responses,
        title: "New Conversation",
        topic: "",
      });

      setCompletionData({ uid, conversationId });
      setIsCompleted(true);
    } catch (error) {
      console.error("Failed to save survey:", error);
      alert("Failed to save survey. Please try again.");
    }
  };

  if (isCompleted && completionData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-md mx-4 space-y-6 rounded-lg border bg-card p-8 shadow-lg">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Survey Complete
            </h2>
            <p className="text-sm text-muted-foreground">
              Thank you for your responses
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Your Access Code
              </p>
              <div className="rounded-md bg-muted px-4 py-3 font-mono text-2xl font-bold tracking-widest text-center">
                {completionData.uid}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Please save this code. You&apos;ll need it to continue.
              </p>
            </div>

            <Button
              onClick={() => router.push(`/${completionData.conversationId}`)}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-8 lg:px-4 py-12">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Survey</h1>
          <p className="text-muted-foreground">
            Please complete this brief survey before starting your conversation.
            This helps us provide you with a personalized experience.
          </p>
        </div>

        {/* Form */}
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
                    {form.formState.isSubmitting
                      ? "Submitting..."
                      : "Submit Survey"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-sm text-muted-foreground text-center">
          All fields marked with <span className="text-destructive">*</span> are
          required
        </p>
      </div>
    </div>
  );
};

export default SurveyView;

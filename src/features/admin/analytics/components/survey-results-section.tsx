"use client";

import { Loader2 } from "lucide-react";
import { useGetAllSurveyResponses } from "@/features/survey/hooks/use-surveys";
import PreSurveyReport from "@/features/admin/analytics/components/pre-survey-report";
import PostSurveyReport from "@/features/admin/analytics/components/post-survey-report";

const SurveyResultsSection = () => {
  const responses = useGetAllSurveyResponses();

  if (responses === undefined) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <PreSurveyReport />
      <PostSurveyReport />
    </div>
  );
};

export default SurveyResultsSection;

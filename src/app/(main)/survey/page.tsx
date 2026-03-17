import React from "react";
import SurveyView from "@/features/survey/views/survey-view";

export default async function SurveyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  return (
    <SurveyView type={params.type} conversationId={params.conversationId} />
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import PreSurveyView from "@/features/survey/views/pre-survey-view";
import PostSurveyView from "@/features/survey/views/post-survey-view";
import { ConversationId } from "../../../../convex/types";

const SurveyView = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const conversationId = searchParams.get(
    "conversationId",
  ) as ConversationId | null;

  if (type === "post" && conversationId) {
    return <PostSurveyView conversationId={conversationId} />;
  }

  return <PreSurveyView />;
};

export default SurveyView;

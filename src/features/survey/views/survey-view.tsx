"use client";

import PreSurveyView from "@/features/survey/views/pre-survey-view";
import PostSurveyView from "@/features/survey/views/post-survey-view";
import { ConversationId } from "../../../../convex/types/convexTypes";

interface SurveyViewProps {
  type?: string;
  conversationId?: string;
}

const SurveyView = ({ type, conversationId }: SurveyViewProps) => {
  if (type === "post" && conversationId) {
    return <PostSurveyView conversationId={conversationId as ConversationId} />;
  }

  return <PreSurveyView />;
};

export default SurveyView;

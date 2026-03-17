import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types/convexTypes";

export const useSubmitSurvey = () => {
  return useMutation(api.db.survey.submitResponse);
};

export const useGetAllSurveyResponses = () => {
  return useQuery(api.db.survey.getAllResponses);
};

export const useGetSurveyResponsesByExternalId = (
  externalId: string | null,
) => {
  return useQuery(
    api.db.survey.getResponsesByExternalId,
    externalId ? { externalId } : "skip",
  );
};

export const useGetSurveyResponsesByConversation = (
  conversationId: ConversationId | null,
) => {
  return useQuery(
    api.db.survey.getResponsesByConversation,
    conversationId ? { conversationId } : "skip",
  );
};

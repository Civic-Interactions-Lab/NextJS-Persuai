import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types";

export const useSubmitSurvey = () => {
  return useMutation(api.survey.submitResponse);
};

export const useGetAllSurveyResponses = () => {
  return useQuery(api.survey.getAllResponses);
};

export const useGetSurveyResponsesByExternalId = (
  externalId: string | null,
) => {
  return useQuery(
    api.survey.getResponsesByExternalId,
    externalId ? { externalId } : "skip",
  );
};

export const useGetSurveyResponsesByConversation = (
  conversationId: ConversationId | null,
) => {
  return useQuery(
    api.survey.getResponsesByConversation,
    conversationId ? { conversationId } : "skip",
  );
};

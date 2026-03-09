import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useSubmitSurvey = () => {
  return useMutation(api.survey.submitResponse);
};

export const useGetResponseById = (id: Id<"surveyResponses"> | null) => {
  return useQuery(api.survey.getResponseById, id ? { id } : "skip");
};

export const useGetResponsesByExternalId = (externalId: string | null) => {
  return useQuery(
    api.survey.getResponsesByExternalId,
    externalId ? { externalId } : "skip",
  );
};

export const useGetResponsesByConversation = (
  conversationId: Id<"conversations"> | null,
) => {
  return useQuery(
    api.survey.getResponsesByConversation,
    conversationId ? { conversationId } : "skip",
  );
};

export const useGetAllSurveyResponses = () => {
  return useQuery(api.survey.getAllResponses);
};

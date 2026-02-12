import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const useSubmitSurvey = () => {
  return useMutation(api.survey.submitResponse);
};

export const useGetAllSurveyResponses = () => {
  return useQuery(api.survey.getAllResponses);
};

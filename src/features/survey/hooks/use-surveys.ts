import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const useSubmitSurvey = () => {
  return useMutation(api.survey.submitResponse);
};

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const useGetConsentForExternalId = (externalId: string | null) => {
  return useQuery(
    api.consents.getConsentForExternalId,
    externalId ? { externalId } : "skip",
  );
};

export const useSubmitConsent = () => {
  return useMutation(api.consents.submitConsent);
};

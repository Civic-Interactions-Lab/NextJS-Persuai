import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LlmPersonaId } from "../../../../convex/types/convexTypes";

export const useGetLlmPersonas = () => {
  return useQuery(api.db.llmPersonas.getAll);
};

export const useGetActiveLlmPersonas = () => {
  return useQuery(api.db.llmPersonas.getActive);
};

export const useGetLlmPersonaById = (id: LlmPersonaId | null) => {
  return useQuery(api.db.llmPersonas.getById, id ? { id } : "skip");
};

export const useCreateLlmPersona = () => {
  return useMutation(api.db.llmPersonas.create);
};

export const useUpdateLlmPersona = () => {
  return useMutation(api.db.llmPersonas.update);
};

export const useRemoveLlmPersona = () => {
  return useMutation(api.db.llmPersonas.remove);
};

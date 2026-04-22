import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LlmConversationId } from "../../../../convex/types/convexTypes";

export const useGetLlmConversations = () => {
  return useQuery(api.db.llmConversations.getAll);
};

export const useGetLlmConversationById = (id: LlmConversationId | null) => {
  return useQuery(
    api.db.llmConversations.getById,
    id ? { id } : "skip",
  );
};

export const useCreateLlmConversation = () => {
  return useMutation(api.db.llmConversations.create);
};

export const useUpdateLlmConversationStatus = () => {
  return useMutation(api.db.llmConversations.updateStatus);
};

export const useIncrementLlmRound = () => {
  return useMutation(api.db.llmConversations.incrementRound);
};

export const useUpdateLlmConversationTitle = () => {
  return useMutation(api.db.llmConversations.updateTitle);
};

export const useRemoveLlmConversation = () => {
  return useMutation(api.db.llmConversations.remove);
};

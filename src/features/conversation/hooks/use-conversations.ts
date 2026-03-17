import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types/convexTypes";

export const useGetConversations = () => {
  return useQuery(api.conversations.getConversations);
};

export const useGetConversationById = (id: ConversationId | null) => {
  return useQuery(api.conversations.getConversationById, id ? { id } : "skip");
};

export const useGetConversationForExternalId = (externalId: string | null) => {
  return useQuery(
    api.conversations.getConversationForExternalId,
    externalId ? { externalId } : "skip",
  );
};

export const useCreateConversation = () => {
  return useMutation(api.conversations.createConversation);
};

export const useUpdateTitle = () => {
  return useMutation(api.conversations.updateTitle);
};

export const useUpdateConversation = () => {
  return useMutation(api.conversations.update);
};

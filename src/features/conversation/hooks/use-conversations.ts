import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types/convexTypes";

export const useGetConversations = () => {
  return useQuery(api.db.conversations.getConversations);
};

export const useGetConversationById = (id: ConversationId | null) => {
  return useQuery(
    api.db.conversations.getConversationById,
    id ? { id } : "skip",
  );
};

export const useGetConversationForExternalId = (externalId: string | null) => {
  return useQuery(
    api.db.conversations.getConversationForExternalId,
    externalId ? { externalId } : "skip",
  );
};

export const useCreateConversation = () => {
  return useMutation(api.db.conversations.createConversation);
};

export const useUpdateTitle = () => {
  return useMutation(api.db.conversations.updateTitle);
};

export const useUpdateConversation = () => {
  return useMutation(api.db.conversations.update);
};

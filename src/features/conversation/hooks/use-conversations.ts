import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types";

export const useGetConversations = () => {
  return useQuery(api.conversations.getConversations);
};

export const useGetConversationById = (id: ConversationId | null) => {
  return useQuery(api.conversations.getConversationById, id ? { id } : "skip");
};

export const useGetConversationsForExternalId = (externalId: string | null) => {
  return useQuery(
    api.conversations.getConversationsForExternalId,
    externalId ? { externalId } : "skip",
  );
};

export const useCompleteConversation = () => {
  return useMutation(api.conversations.completeConversation);
};

export const useCreateConversation = () => {
  return useMutation(api.conversations.createConversation);
};

export const useUpdateTitle = () => {
  return useMutation(api.conversations.updateTitle);
};

export const useUpdateTopicAndAgent = () => {
  return useMutation(api.conversations.updateTopicAndAgent);
};

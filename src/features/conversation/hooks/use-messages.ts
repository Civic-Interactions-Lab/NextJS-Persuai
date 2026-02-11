import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types";

export const useGetMessages = (conversationId: ConversationId) => {
  return useQuery(api.messages.getMessages, { conversationId });
};

export const useCreateMessage = () => {
  return useMutation(api.messages.createMessage);
};

export const useUpdateMessage = () => {
  return useMutation(api.messages.updateMessage);
};

export const useUpdateMessageAgreement = () => {
  return useMutation(api.messages.updateMessageAgreement);
};

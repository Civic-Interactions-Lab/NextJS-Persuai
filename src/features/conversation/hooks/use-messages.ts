import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConversationId } from "../../../../convex/types/convexTypes";

export const useGetMessages = (conversationId: ConversationId | null) => {
  return useQuery(
    api.db.messages.getMessages,
    conversationId ? { conversationId } : "skip",
  );
};

export const useCreateMessage = () => {
  return useMutation(api.db.messages.createMessage);
};

export const useUpdateMessage = () => {
  return useMutation(api.db.messages.updateMessage);
};

export const useUpdateMessageAgreement = () => {
  return useMutation(api.db.messages.updateMessageAgreement);
};

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { LlmConversationId } from "../../../../convex/types/convexTypes";

export const useGetLlmMessages = (llmConversationId: LlmConversationId | null) => {
  return useQuery(
    api.db.llmMessages.getMessages,
    llmConversationId ? { llmConversationId } : "skip",
  );
};

export const useCreateLlmMessage = () => {
  return useMutation(api.db.llmMessages.createMessage);
};

export const useUpdateLlmMessage = () => {
  return useMutation(api.db.llmMessages.updateMessage);
};

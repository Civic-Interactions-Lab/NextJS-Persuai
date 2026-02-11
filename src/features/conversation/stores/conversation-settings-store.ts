import { create } from "zustand";
import { AIAgent } from "@/features/conversation/constants/ai-agents";
import { Topic } from "@/features/conversation/constants/topics";

interface ConversationSettings {
  selectedTopic: Topic | null;
  selectedAgent: AIAgent | null;
  setSelectedTopic: (topic: Topic | null) => void;
  setSelectedAgent: (agent: AIAgent | null) => void;
  reset: () => void;
}

export const useConversationSettings = create<ConversationSettings>((set) => ({
  selectedTopic: null,
  selectedAgent: null,
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  reset: () => set({ selectedTopic: null, selectedAgent: null }),
}));

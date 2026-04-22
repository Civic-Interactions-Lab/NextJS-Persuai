"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, BotMessageSquare } from "lucide-react";
import { useDebateSheetStore } from "@/features/llm-conversations/stores/use-debate-sheet-store";

const LlmConversationsView = () => {
  const openSheet = useDebateSheetStore((s) => s.openSheet);

  return (
    <>
      {/* Header with sidebar trigger */}
      <div className="flex items-center gap-3 px-3 py-3 border-b shrink-0">
        <SidebarTrigger className="size-8 shrink-0" />
        <h1 className="font-semibold text-sm">LLM Debates</h1>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-4">
          <BotMessageSquare className="size-12 mx-auto text-muted-foreground opacity-40" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">LLM vs LLM Debates</h2>
            <p className="text-sm text-muted-foreground">
              Create an LLM persona and watch it debate one of your agents for
              up to 30 rounds.
            </p>
          </div>
          <Button onClick={openSheet}>
            <Plus className="size-4 mr-2" />
            New Debate
          </Button>
        </div>
      </div>
    </>
  );
};

export default LlmConversationsView;

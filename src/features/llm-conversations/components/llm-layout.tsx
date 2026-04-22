"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import LlmSidebar from "@/features/llm-conversations/components/llm-sidebar";
import NewDebateSheet from "@/features/llm-conversations/components/new-debate-sheet";
import { useDebateSheetStore } from "@/features/llm-conversations/stores/use-debate-sheet-store";

interface LlmLayoutProps {
  children: React.ReactNode;
}

const LlmLayout = ({ children }: LlmLayoutProps) => {
  const { open, setOpen, openSheet } = useDebateSheetStore();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <LlmSidebar onNewDebate={openSheet} />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {children}
        </div>
      </div>

      <NewDebateSheet open={open} onOpenChange={setOpen} />
    </SidebarProvider>
  );
};

export default LlmLayout;

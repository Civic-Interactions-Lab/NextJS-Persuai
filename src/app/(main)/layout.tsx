import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import ConversationSidebar from "@/features/conversation/components/conversation-sidebar";
import ConversationHeader from "@/features/conversation/components/conversation-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <ConversationSidebar />
        <div className="flex flex-col flex-1">
          <ConversationHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

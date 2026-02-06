import { SidebarTrigger } from "@/components/ui/sidebar";

export function ConversationHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />
      <div className="flex-1">
        {/* Add any header content here like title, breadcrumbs, etc */}
      </div>
    </header>
  );
}

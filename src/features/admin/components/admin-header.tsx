"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

const TITLE_MAP: Record<string, string> = {
  "/dashboard": "Overview",
  "/analytics": "Survey Insights",
  "/settings": "Customization",
};

const AdminHeader = () => {
  const pathname = usePathname();
  const title = TITLE_MAP[pathname] ?? "Overview";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 w-full">
      <SidebarTrigger />
      <h1 className="font-medium text-sm">{title}</h1>
    </header>
  );
};

export default AdminHeader;

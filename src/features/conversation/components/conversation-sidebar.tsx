"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "@/components/logo";
import { useGetConversationForExternalId } from "@/features/conversation/hooks/use-conversations";

const ConversationSidebar = () => {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { setTheme } = useTheme();

  const externalId =
    typeof window !== "undefined" ? localStorage.getItem("PROLIFIC_PID") : null;

  const conversation = useGetConversationForExternalId(externalId);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="h-10">
            <Link href="/" prefetch>
              <Logo size={24} />
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
          {!isCollapsed && (
            <ScrollArea className="h-100 mt-3">
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversation && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip={conversation.title}
                        isActive={
                          pathname === `/conversations/${conversation._id}`
                        }
                        asChild
                      >
                        <Link
                          href={`/conversations/${conversation._id}`}
                          prefetch
                          className="flex w-full max-w-56"
                        >
                          <span className="truncate">{conversation.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </ScrollArea>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Toggle Theme"
              className="gap-x-4 h-10"
              onClick={toggleTheme}
            >
              <Sun className="size-4 block dark:hidden" />
              <Moon className="size-4 hidden dark:block" />
              <span className="block dark:hidden">Dark Mode</span>
              <span className="hidden dark:block">Light Mode</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ConversationSidebar;

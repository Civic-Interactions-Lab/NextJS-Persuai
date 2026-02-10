"use client";

import { PlusIcon, SearchIcon, XIcon, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { useGetConversations } from "@/features/conversation/hooks/use-conversations";
import Logo from "@/components/logo";
import NewConversationDialog from "@/features/conversation/components/new-conversation-dialog";

const ConversationSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const { setTheme } = useTheme();
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const conversations = useGetConversations();

  const handleNewChat = () => {
    setDialogOpen(true);
  };

  const handleConsentConfirm = () => {
    setDialogOpen(false);
    router.push("/survey");
  };

  const handleConsentCancel = () => {
    setDialogOpen(false);
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setSearchTerm("");
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const filteredConversations = useMemo(() => {
    if (!conversations || !searchTerm.trim()) return conversations;

    const lowerSearch = searchTerm.toLowerCase();
    return conversations.filter((conv) =>
      conv.title.toLowerCase().includes(lowerSearch),
    );
  }, [conversations, searchTerm]);

  const isCollapsed = state === "collapsed";

  return (
    <>
      <NewConversationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConsentConfirm}
      />

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
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="New Chat"
                    className="gap-x-4"
                    onClick={handleNewChat}
                  >
                    <PlusIcon className="size-4" />
                    <span>New Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Search"
                    isActive={isSearching}
                    className="gap-x-4"
                    onClick={toggleSearch}
                  >
                    {isSearching ? (
                      <XIcon className="size-4" />
                    ) : (
                      <SearchIcon className="size-4" />
                    )}
                    <span>{isSearching ? "Close Search" : "Search"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isSearching && !isCollapsed && (
            <SidebarGroup>
              <SidebarGroupContent>
                <div className="px-2">
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    className="h-9"
                  />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
            {!isCollapsed && (
              <ScrollArea className="h-100 pr-3 mt-3">
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredConversations?.map((conversation) => (
                      <SidebarMenuItem key={conversation._id}>
                        <SidebarMenuButton
                          tooltip={conversation.title}
                          isActive={pathname === `/${conversation._id}`}
                          className="gap-x-4 overflow-hidden"
                          asChild
                        >
                          <Link href={`/${conversation._id}`} prefetch>
                            <span className="truncate overflow-hidden whitespace-nowrap">
                              {conversation.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                    {filteredConversations?.length === 0 && searchTerm && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        No conversations found
                      </div>
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
    </>
  );
};

export default ConversationSidebar;

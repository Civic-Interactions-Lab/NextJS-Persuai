"use client";

import {
  PlusIcon,
  SearchIcon,
  Settings,
  User,
  XIcon,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const ConversationSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  const createConversation = useMutation(api.conversations.createConversation);
  const conversations = useQuery(api.conversations.getConversations, {
    userId: "guest",
  });

  const handleNewChat = async () => {
    const conversationId = await createConversation({
      userId: "guest",
      title: "New Conversation",
      topic: "",
    });
    router.push(`/${conversationId}`);
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setSearchTerm("");
    }
  };

  const handleSignOut = () => {
    console.log("Sign out");
    setUserPopoverOpen(false);
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
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="gap-x-4 h-10">
            <Link href="/" prefetch>
              <Image
                src="/logo.svg"
                alt="PersuAI logo"
                width={24}
                height={24}
              />
              <span className="font-bold tracking-wider">
                <span className="text-black">PERSU</span>
                <span className="text-gray-400">AI</span>
              </span>
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
            <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
              <PopoverTrigger asChild>
                <SidebarMenuButton tooltip="User Menu" className="gap-x-4 h-10">
                  <User className="size-4" />
                  <span>Guest User</span>
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end" side="top">
                <div className="space-y-1">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">Guest User</p>
                    <p className="text-xs text-muted-foreground">
                      guest@example.com
                    </p>
                  </div>
                  <Separator />
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9"
                    onClick={() => {
                      setUserPopoverOpen(false);
                      router.push("/settings");
                    }}
                  >
                    <Settings className="size-4" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9"
                    onClick={handleSignOut}
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ConversationSidebar;

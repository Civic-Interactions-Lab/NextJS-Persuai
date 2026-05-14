"use client";

import { useState } from "react";
import { Moon, Sun, PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "@/components/logo";
import {
  useGetLlmConversations,
  useRemoveLlmConversation,
} from "@/features/llm-conversations/hooks/use-llm-conversations";
import {
  LlmConversation,
  LlmConversationId,
} from "../../../../convex/types/convexTypes";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<string, string> = {
  idle: "bg-muted-foreground",
  running: "bg-yellow-400 animate-pulse",
  completed: "bg-green-400",
  error: "bg-red-400",
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
interface LlmSidebarProps {
  onNewDebate: () => void;
}

const LlmSidebar = ({ onNewDebate }: LlmSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const { setTheme } = useTheme();
  const conversations = useGetLlmConversations();
  const removeWithMessages = useRemoveLlmConversation();
  const isCollapsed = state === "collapsed";

  const [deleteTarget, setDeleteTarget] = useState<LlmConversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await removeWithMessages({ id: deleteTarget._id as LlmConversationId });
      if (pathname === `/llm-conversations/${deleteTarget._id}`) {
        router.push("/llm-conversations");
      }
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-10">
              <Link href="/llm-conversations" prefetch>
                <Logo size={24} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            {isCollapsed ? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="New Debate"
                    onClick={onNewDebate}
                    className="h-12"
                  >
                    <PlusIcon className="size-5!" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : (
              <div className="flex items-center justify-between pr-2">
                <SidebarGroupLabel>Debates</SidebarGroupLabel>
                <button
                  onClick={onNewDebate}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="New Debate"
                >
                  <PlusIcon className="size-4" />
                </button>
              </div>
            )}

            {!isCollapsed && (
              <ScrollArea className="h-[calc(100vh-180px)] mt-1">
                <SidebarGroupContent>
                  <SidebarMenu>
                    {conversations === undefined ? (
                      <div className="px-2 py-4 text-xs text-muted-foreground">
                        Loading...
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="px-2 py-4 text-xs text-muted-foreground">
                        No debates yet. Start one!
                      </div>
                    ) : (
                      conversations.map((conv: LlmConversation) => (
                        <SidebarMenuItem key={conv._id} className="group/item">
                          <SidebarMenuButton
                            tooltip={conv.title}
                            isActive={pathname === `/llm-conversations/${conv._id}`}
                            asChild
                          >
                            <Link
                              href={`/llm-conversations/${conv._id}`}
                              prefetch
                              className="flex w-full items-center gap-2 max-w-56"
                            >
                              <span
                                className={cn(
                                  "size-2 rounded-full shrink-0",
                                  STATUS_DOT[conv.status] ?? "bg-muted-foreground",
                                )}
                              />
                              <span className="truncate flex-1">{conv.title}</span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1 py-0 shrink-0 group-hover/item:hidden"
                              >
                                {conv.roundCount}/{conv.maxRounds}
                              </Badge>
                            </Link>
                          </SidebarMenuButton>

                          <button
                            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 size-6 hidden group-hover/item:flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDeleteTarget(conv);
                            }}
                          >
                            <Trash2Icon className="size-3.5" />
                          </button>
                        </SidebarMenuItem>
                      ))
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete debate?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; and all its messages will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LlmSidebar;

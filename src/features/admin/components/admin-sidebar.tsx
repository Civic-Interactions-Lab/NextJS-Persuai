"use client";

import {
  Moon,
  Sun,
  LayoutDashboardIcon,
  BarChart3Icon,
  SettingsIcon,
  LogOutIcon,
  ChevronRightIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Logo from "@/components/logo";
import { logout } from "@/features/admin/actions/logout";

const AdminSidebar = () => {
  const pathname = usePathname();
  const { setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSignOut = async () => {
    await logout();
  };

  const isAnalyticsActive = pathname.startsWith("/analytics");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="h-10">
            <Link href="/dashboard" prefetch>
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
                  asChild
                  tooltip="Overview"
                  isActive={pathname === "/dashboard"}
                  className="gap-x-4"
                >
                  <Link href="/dashboard" prefetch>
                    <LayoutDashboardIcon className="size-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible
                defaultOpen={isAnalyticsActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Analytics"
                      isActive={isAnalyticsActive}
                      className="gap-x-4"
                    >
                      <BarChart3Icon className="size-4" />
                      <span>Analytics</span>
                      <ChevronRightIcon className="ml-auto size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === "/analytics/human"}
                        >
                          <Link href="/analytics/human" prefetch>
                            Human vs. Agent
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === "/analytics/llm"}
                        >
                          <Link href="/analytics/llm" prefetch>
                            LLM vs. LLM
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Settings"
                  isActive={pathname === "/settings"}
                  className="gap-x-4"
                >
                  <Link href="/settings" prefetch>
                    <SettingsIcon className="size-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
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
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              className="gap-x-4 h-10 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOutIcon className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;

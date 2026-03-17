"use client";

import {
  Moon,
  Sun,
  LayoutDashboardIcon,
  BarChart3Icon,
  SettingsIcon,
  LogOutIcon,
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
} from "@/components/ui/sidebar";
import Logo from "@/components/logo";
import { logout } from "@/features/admin/actions/logout";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Analytics", href: "/analytics", icon: BarChart3Icon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const { setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSignOut = async () => {
    await logout();
  };

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
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={label}
                    isActive={pathname === href}
                    className="gap-x-4"
                  >
                    <Link href={href} prefetch>
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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

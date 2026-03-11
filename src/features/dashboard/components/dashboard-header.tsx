"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, Settings, LayoutDashboard } from "lucide-react";
import { logout } from "@/features/dashboard/actions/logout";
import { useTheme } from "next-themes";
import Logo from "@/components/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DashboardHeader = () => {
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const isSettings = pathname === "/settings";

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-3">
      <Link href="/">
        <Logo size={28} />
      </Link>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Link href={isSettings ? "/dashboard" : "/settings"}>
          <Button variant="outline" size="sm">
            {isSettings ? (
              <>
                <LayoutDashboard className="size-4" />
                <span className="hidden sm:block ml-2">Dashboard</span>
              </>
            ) : (
              <>
                <Settings className="size-4" />
                <span className="hidden sm:block ml-2">Settings</span>
              </>
            )}
          </Button>
        </Link>

        <Button variant="outline" size="sm" onClick={toggleTheme}>
          <Sun className="size-4 block dark:hidden" />
          <Moon className="size-4 hidden dark:block" />
          <span className="hidden sm:block ml-2 dark:hidden">Dark Mode</span>
          <span className="hidden sm:dark:block ml-2">Light Mode</span>
        </Button>

        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut className="size-4" />
            <span className="hidden sm:block ml-2">Logout</span>
          </Button>
        </form>
      </div>
    </header>
  );
};

export default DashboardHeader;

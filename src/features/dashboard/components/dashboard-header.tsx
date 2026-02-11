"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun } from "lucide-react";
import { logout } from "@/features/dashboard/actions/logout";
import { useTheme } from "next-themes";
import Logo from "@/components/logo";
import Link from "next/link";

const DashboardHeader = () => {
  const { setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header className="border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo size={28} />
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            <Sun className="size-4 mr-2 block dark:hidden" />
            <Moon className="size-4 mr-2 hidden dark:block" />
            <span className="block dark:hidden">Dark Mode</span>
            <span className="hidden dark:block">Light Mode</span>
          </Button>

          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

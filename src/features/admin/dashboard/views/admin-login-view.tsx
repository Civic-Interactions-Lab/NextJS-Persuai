"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { login } from "@/features/admin/actions/login";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const AdminLoginView = () => {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md mx-4 space-y-6">
        {/* Back to Home Button */}
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="size-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Login Card */}
        <div className="rounded-lg border bg-card p-8 shadow-lg space-y-6">
          <div className="space-y-4 text-center">
            <Logo size={32} className="justify-center" />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Admin Access
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter the admin password to continue
              </p>
            </div>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter admin password"
                autoFocus
                required
              />
              {state?.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Verifying..." : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginView;

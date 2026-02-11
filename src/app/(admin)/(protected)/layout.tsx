import { redirect } from "next/navigation";
import { checkAuth } from "@/features/dashboard/lib/check-auth";
import DashboardHeader from "@/features/dashboard/components/dashboard-header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    redirect("/admin-login");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="p-6">{children}</main>
    </div>
  );
}

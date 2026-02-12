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
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <DashboardHeader />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}

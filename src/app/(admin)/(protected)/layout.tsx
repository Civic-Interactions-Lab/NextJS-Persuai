import { redirect } from "next/navigation";
import { checkAuth } from "@/features/admin/dashboard/lib/check-auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/features/admin/components/admin-sidebar";
import AdminHeader from "@/features/admin/components/admin-header";

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
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

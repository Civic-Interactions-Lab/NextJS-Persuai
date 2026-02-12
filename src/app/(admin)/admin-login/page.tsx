import { redirect } from "next/navigation";
import { checkAuth } from "@/features/dashboard/lib/check-auth";
import AdminLoginView from "@/features/dashboard/views/admin-login-view";

export default async function AdminLoginPage() {
  const isAuthenticated = await checkAuth();

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return <AdminLoginView />;
}

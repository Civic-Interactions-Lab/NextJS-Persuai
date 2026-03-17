import { cookies } from "next/headers";

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin-token")?.value;

  if (!process.env.ADMIN_TOKEN || !adminToken) return false;

  return adminToken === process.env.ADMIN_TOKEN;
}

import { cookies } from "next/headers";

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin-token")?.value;

  return adminToken === process.env.ADMIN_TOKEN;
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type LoginState = {
  error: string;
} | null;

export async function login(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();

    cookieStore.set("admin-token", process.env.ADMIN_TOKEN!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    redirect("/dashboard");
  }

  return { error: "Invalid password" };
}

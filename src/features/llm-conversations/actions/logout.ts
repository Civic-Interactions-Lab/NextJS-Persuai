"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function llmLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("llm-token");
  redirect("/llm-login");
}

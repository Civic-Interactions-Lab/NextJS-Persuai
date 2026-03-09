import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams(params).toString();
  redirect(`/conversations${query ? `?${query}` : ""}`);
}

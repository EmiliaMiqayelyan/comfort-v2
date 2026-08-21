import { redirect } from "next/navigation";
const adminLocale = "am";

export default async function AdminSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug?.length ? slug.join("/") : "";
  redirect(`/${adminLocale}/admin${path ? `/${path}` : ""}`);
}

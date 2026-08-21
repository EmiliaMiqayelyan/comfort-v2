import { redirect } from "next/navigation";
const adminLocale = "am";

/** Safety net when /admin is opened without a locale prefix */
export default function AdminRootRedirect() {
  redirect(`/${adminLocale}/admin`);
}

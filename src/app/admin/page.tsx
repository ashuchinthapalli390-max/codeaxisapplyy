import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import AdminLoginPage from "./login/page";

export const dynamic = "force-dynamic";

export default async function AdminRootPage() {
  const session = await getAdminSession();

  if (session.isValid) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginPage />;
}

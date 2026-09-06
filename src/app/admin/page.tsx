import { redirect } from "next/navigation";

import AdminDashboard from "../../components/AdminDashboard";
import { createServerClient } from "../../lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  return <AdminDashboard />;
}

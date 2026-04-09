import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: roster } = await supabase.from("vorstand_roster").select("*").order("id");
  return <AdminClient roster={roster ?? []} />;
}

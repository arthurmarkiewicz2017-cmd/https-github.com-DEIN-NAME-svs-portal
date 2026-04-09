import { NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  // 1. Prüfen: aufrufender User ist Admin
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return NextResponse.json({ error: "Keine Admin-Rechte" }, { status: 403 });

  const { id, email, full_name, role, phone } = await req.json();
  if (!email || !full_name || !role) {
    return NextResponse.json({ error: "email/full_name/role fehlen" }, { status: 400 });
  }

  // 2. Admin-Client: User anlegen + Einladungslink senden
  const admin = createSupabaseAdmin();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/reset`,
    data: { full_name, role },
  });
  if (inviteErr) return NextResponse.json({ error: inviteErr.message }, { status: 500 });

  // 3. Profil in public.profiles anlegen
  const newUserId = invited.user?.id;
  if (newUserId) {
    await admin.from("profiles").upsert({
      id: newUserId, email, full_name, role, phone,
    });
  }

  // 4. Roster als "invited" markieren
  if (id) await admin.from("vorstand_roster").update({ invited: true }).eq("id", id);

  return NextResponse.json({ ok: true });
}

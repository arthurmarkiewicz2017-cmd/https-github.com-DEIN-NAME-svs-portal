"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const FOLDER_LABELS: Record<string, string> = {
  allgemein: "Allgemein",
  "1_vorsitzender": "1. Vorsitzender",
  "2_vorsitzender": "2. Vorsitzender",
  jugendleiter: "Jugendleiter",
  schatzmeister: "Schatzmeister",
  "2_jugendleiter": "2. Jugendleiter",
  leiter_maennerfussball: "Leiter Männerfußball",
  leiter_frauen_maedchen: "Leiter Frauen-/Mädchenfußball",
  sponsoren: "Sponsorenbeauftragter",
  leiter_technik: "Leiter Technik",
  oeffentlichkeitsarbeit: "Öffentlichkeitsarbeit",
  ehrenamt: "Ehrenamtsbeauftragter",
};

type Profile = { id: string; full_name: string; role: string; email: string } | null;
type FileRow = {
  id: string; original_name: string; storage_path: string;
  size_bytes: number; folder: string; visibility: string; created_at: string;
};

export default function DashboardClient({ userEmail, profile }: { userEmail: string; profile: Profile }) {
  const supabase = createSupabaseBrowser();
  const router = useRouter();
  const [files, setFiles] = useState<FileRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState("allgemein");
  const [visibility, setVisibility] = useState<"alle" | "vorstand" | "admin">("vorstand");

  const isAdmin = profile?.role === "admin";

  async function load() {
    const { data } = await supabase.from("files").select("*").order("created_at", { ascending: false });
    if (data) setFiles(data as FileRow[]);
  }
  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${folder}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("files").upload(path, file);
    if (!upErr) {
      await supabase.from("files").insert({
        storage_path: path,
        original_name: file.name,
        size_bytes: file.size,
        mime_type: file.type,
        folder,
        visibility,
        uploaded_by: profile?.id,
      });
      await load();
    } else alert(upErr.message);
    setUploading(false);
    e.target.value = "";
  }

  async function handleDownload(f: FileRow) {
    const { data, error } = await supabase.storage.from("files").createSignedUrl(f.storage_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else alert(error?.message);
  }

  async function handleDelete(f: FileRow) {
    if (!confirm(`"${f.original_name}" löschen?`)) return;
    await supabase.storage.from("files").remove([f.storage_path]);
    await supabase.from("files").delete().eq("id", f.id);
    await load();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="bg-svs-green text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SVS" className="h-10 w-auto bg-white rounded p-1"/>
            <div>
              <h1 className="font-bold">SV Schmöckwitz-Eichwalde</h1>
              <p className="text-xs opacity-80">Vorstandsportal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline">{profile?.full_name ?? userEmail}</span>
            {isAdmin && <Link href="/admin" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded">Admin</Link>}
            <button onClick={logout} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded">Abmelden</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <section className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-svs-darkgreen mb-4">Datei Upload</h2>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <select value={folder} onChange={e => setFolder(e.target.value)} className="border rounded-lg px-3 py-2">
              <option value="allgemein">Allgemein</option>
              <option value="1_vorsitzender">1. Vorsitzender</option>
              <option value="2_vorsitzender">2. Vorsitzender</option>
              <option value="jugendleiter">Jugendleiter</option>
              <option value="schatzmeister">Schatzmeister</option>
              <option value="2_jugendleiter">2. Jugendleiter</option>
              <option value="leiter_maennerfussball">Leiter Männerfußball</option>
              <option value="leiter_frauen_maedchen">Leiter Frauen-/Mädchenfußball</option>
              <option value="sponsoren">Sponsorenbeauftragter</option>
              <option value="leiter_technik">Leiter Technik</option>
              <option value="oeffentlichkeitsarbeit">Öffentlichkeitsarbeit</option>
              <option value="ehrenamt">Ehrenamtsbeauftragter</option>
            </select>
            <select value={visibility} onChange={e => setVisibility(e.target.value as any)} className="border rounded-lg px-3 py-2">
              <option value="vorstand">Sichtbar: Vorstand</option>
              <option value="alle">Sichtbar: Alle Eingeloggten</option>
              <option value="admin">Sichtbar: Nur Admin</option>
            </select>
            <label className="bg-svs-green hover:bg-svs-darkgreen text-white px-4 py-2 rounded-lg cursor-pointer">
              {uploading ? "Lade hoch…" : "Datei Upload"}
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading}/>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-svs-darkgreen mb-4">Datei Download ({files.length})</h2>
          {files.length === 0 && <p className="text-gray-500 text-sm">Noch keine Dateien.</p>}
          {Object.entries(
            files.reduce<Record<string, FileRow[]>>((acc, f) => {
              (acc[f.folder] ||= []).push(f); return acc;
            }, {})
          ).map(([folderName, folderFiles]) => (
            <details key={folderName} open className="mb-4 border rounded-lg">
              <summary className="cursor-pointer font-semibold px-3 py-2 bg-svs-light text-svs-darkgreen rounded-t-lg">
                📁 {FOLDER_LABELS[folderName] ?? folderName} ({folderFiles.length})
              </summary>
              <div className="divide-y">
                {folderFiles.map(f => (
                  <div key={f.id} className="py-3 px-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-semibold">{f.original_name}</p>
                      <p className="text-xs text-gray-500">
                        {f.visibility} · {(f.size_bytes / 1024).toFixed(1)} KB · {new Date(f.created_at).toLocaleString("de-DE")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDownload(f)} className="bg-svs-green text-white px-3 py-1 rounded text-sm hover:bg-svs-darkgreen">Download</button>
                      <button onClick={() => handleDelete(f)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Löschen</button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </section>
      </main>
    </div>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";

type Roster = {
  id: number; funktion: string; full_name: string; email: string;
  phone: string | null; role: string; invited: boolean;
};

export default function AdminClient({ roster }: { roster: Roster[] }) {
  const [items, setItems] = useState(roster);
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function invite(r: Roster) {
    setBusy(r.id); setMsg(null);
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, email: r.email, full_name: r.full_name, role: r.role, phone: r.phone }),
    });
    const json = await res.json();
    setBusy(null);
    if (!res.ok) { setMsg(`Fehler: ${json.error}`); return; }
    setMsg(`Einladung an ${r.email} gesendet.`);
    setItems(items.map(i => i.id === r.id ? { ...i, invited: true } : i));
  }

  return (
    <div className="min-h-screen">
      <header className="bg-svs-green text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold">Admin · Benutzerverwaltung</h1>
          <Link href="/dashboard" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm">Zurück</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {msg && <div className="bg-white shadow rounded-lg p-3 mb-4 text-sm">{msg}</div>}

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-svs-light text-svs-darkgreen">
              <tr>
                <th className="text-left p-3">Funktion</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">E-Mail</th>
                <th className="text-left p-3">Rolle</th>
                <th className="text-left p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.funktion}</td>
                  <td className="p-3 font-semibold">{r.full_name}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3"><code className="text-xs">{r.role}</code></td>
                  <td className="p-3">
                    {r.invited
                      ? <span className="text-green-600 font-semibold">✓ eingeladen</span>
                      : <span className="text-gray-500">offen</span>}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => invite(r)}
                      disabled={busy === r.id}
                      className="bg-svs-green hover:bg-svs-darkgreen text-white px-3 py-1 rounded text-sm disabled:opacity-50">
                      {busy === r.id ? "…" : r.invited ? "Erneut senden" : "Willkommensmail senden"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Die Einladung erstellt den Account in Supabase und sendet dem Nutzer einen Link, über den er sein eigenes Passwort setzt.
          Nach dem ersten Login kann er auf dem Smartphone Face ID / Touch ID als Passkey hinzufügen.
        </p>
      </main>
    </div>
  );
}

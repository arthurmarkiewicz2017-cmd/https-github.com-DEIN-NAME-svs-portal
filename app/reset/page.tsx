"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function ResetPage() {
  const supabase = createSupabaseBrowser();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMsg(error.message);
    else { setMsg("Passwort gespeichert. Du wirst weitergeleitet…"); setTimeout(() => router.push("/dashboard"), 1500); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-xl font-bold text-svs-darkgreen mb-4">Neues Passwort setzen</h1>
        <input type="password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)}
               placeholder="Mindestens 8 Zeichen"
               className="w-full border rounded-lg px-3 py-2 mb-4" />
        {msg && <p className="text-sm mb-3">{msg}</p>}
        <button className="w-full bg-svs-green hover:bg-svs-darkgreen text-white py-2 rounded-lg font-semibold">Speichern</button>
      </form>
    </div>
  );
}

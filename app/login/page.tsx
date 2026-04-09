"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMsg(error.message);
    else router.push("/dashboard");
  }

  async function handleReset() {
    if (!email) return setMsg("Bitte E-Mail eingeben.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    });
    setMsg(error ? error.message : "E-Mail zum Zurücksetzen gesendet.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-svs-green flex items-center justify-center text-white font-bold text-xl">SVS</div>
          <div>
            <h1 className="text-xl font-bold text-svs-darkgreen">SV Schmöckwitz-Eichwalde</h1>
            <p className="text-sm text-gray-500">Vorstandsportal</p>
          </div>
        </div>
        <label className="block text-sm font-semibold mb-1">E-Mail</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
               className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-svs-green" />
        <label className="block text-sm font-semibold mb-1">Passwort</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
               className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-svs-green" />
        {msg && <p className="text-sm text-red-600 mb-3">{msg}</p>}
        <button type="submit" disabled={loading}
                className="w-full bg-svs-green hover:bg-svs-darkgreen text-white font-semibold py-2 rounded-lg transition">
          {loading ? "…" : "Anmelden"}
        </button>
        <button type="button" onClick={handleReset}
                className="w-full mt-3 text-sm text-svs-darkgreen hover:underline">
          Passwort vergessen?
        </button>
        <p className="text-xs text-gray-400 mt-6 text-center">
          Auf dem Smartphone kannst du nach erstem Login Face ID / Touch ID via Browser-Passkey aktivieren.
        </p>
      </form>
    </div>
  );
}

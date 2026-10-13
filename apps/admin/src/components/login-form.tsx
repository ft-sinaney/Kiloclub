"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@kiloclub/shared/supabase/client";
import { safeNext } from "@/lib/safe-next";
import { GoogleIcon } from "./google-icon";

export function LoginForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "/");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error"));

  async function google() {
    setBusy(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
    // Full page load so the server sees the new session cookie straight away.
    window.location.assign(next);
  }

  return (
    <div className="card w-full max-w-sm p-7">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.webp" alt="Kilo Club" className="mx-auto h-24 w-auto" />
      <h1 className="mt-5 text-center font-display text-2xl tracking-wide text-white uppercase">Admin login</h1>
      <p className="mt-1 text-center text-xs text-ink-400">Only Kilo Club admins can access this panel.</p>

      <button type="button" onClick={google} disabled={busy} className="btn mt-6 w-full bg-white text-ink-900 hover:bg-ink-200">
        <GoogleIcon /> Continue with Google
      </button>
      <div className="my-5 flex items-center gap-3 text-xs text-ink-500">
        <span className="h-px flex-1 bg-ink-700" /> or <span className="h-px flex-1 bg-ink-700" />
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className="btn-gold w-full">
          {busy && <Loader2 className="size-4 animate-spin" />} Log in
        </button>
      </form>
    </div>
  );
}

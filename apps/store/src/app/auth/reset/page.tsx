"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@kiloclub/shared/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    router.replace("/account");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
        <h1 className="font-display text-3xl text-white uppercase">New password</h1>
        <input className="input" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button className="btn-gold w-full" disabled={busy}>Save password</button>
      </form>
    </div>
  );
}

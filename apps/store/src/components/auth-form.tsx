"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { isSupabaseConfigured } from "@kiloclub/shared/supabase/config";
import { createClient } from "@kiloclub/shared/supabase/client";
import { safeNext } from "@/lib/safe-next";
import { GoogleIcon } from "./google-icon";

type Mode = "login" | "signup" | "forgot";

export function AuthForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "/account");
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error"));
  const [notice, setNotice] = useState<string | null>(null);

  if (!isSupabaseConfigured) {
    return (
      <div className="card p-6 text-sm text-ink-300">
        Login turns on once the store is connected to Supabase. See the setup steps in the README.
      </div>
    );
  }

  const callback = (target: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`;

  async function google() {
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback(next) },
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
    setNotice(null);
    const supabase = createClient();

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback("/auth/reset") });
      setBusy(false);
      if (error) setError(error.message);
      else setNotice("Check your inbox for a link to reset your password.");
      return;
    }

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() }, emailRedirectTo: callback(next) },
      });
      setBusy(false);
      if (error) return setError(error.message);
      if (!data.session) return setNotice("Almost there! We've emailed you a link to confirm your account.");
      window.location.assign(next);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
    // Full page load so the server sees the new session cookie straight away.
    window.location.assign(next);
  }

  const titles: Record<Mode, string> = {
    login: "Welcome back",
    signup: "Join the club",
    forgot: "Reset password",
  };

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="font-display text-3xl text-white uppercase">{titles[mode]}</h1>
      <p className="mt-1 text-sm text-ink-400">
        {mode === "signup"
          ? "Save favourites and keep track of your enquiries."
          : mode === "forgot"
            ? "We'll email you a reset link."
            : "Log in to your Kilo Club account."}
      </p>

      {notice ? (
        <div className="mt-6 flex gap-3 rounded-xl border border-gold-500/30 bg-gold-400/5 p-4 text-sm text-gold-100">
          <MailCheck className="size-5 shrink-0 text-gold-400" />
          {notice}
        </div>
      ) : (
        <>
          {mode !== "forgot" && (
            <>
              <button type="button" onClick={google} disabled={busy} className="btn mt-6 w-full border border-ink-600 bg-white text-ink-900 hover:bg-ink-200">
                <GoogleIcon /> Continue with Google
              </button>
              <div className="my-5 flex items-center gap-3 text-xs text-ink-500">
                <span className="h-px flex-1 bg-ink-700" /> or with email <span className="h-px flex-1 bg-ink-700" />
              </div>
            </>
          )}

          <form onSubmit={submit} className={`space-y-4 ${mode === "forgot" ? "mt-6" : ""}`}>
            {mode === "signup" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-300">Full name</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-300">Email</span>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            {mode !== "forgot" && (
              <div>
                <div className="mb-1.5 flex justify-between text-xs font-medium text-ink-300">
                  <label htmlFor="password">Password</label>
                  {mode === "login" && (
                    <button type="button" onClick={() => setMode("forgot")} className="font-normal text-ink-400 hover:text-gold-300">
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            )}
            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            <button type="submit" disabled={busy} className="btn-gold w-full">
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Log in"}
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-ink-400">
        {mode === "login" ? (
          <>New here? <button type="button" onClick={() => { setMode("signup"); setNotice(null); setError(null); }} className="font-semibold text-gold-300 hover:underline">Create an account</button></>
        ) : (
          <>Already a member? <button type="button" onClick={() => { setMode("login"); setNotice(null); setError(null); }} className="font-semibold text-gold-300 hover:underline">Log in</button></>
        )}
      </p>
      <p className="mt-3 text-center text-xs text-ink-500">
        No account needed to enquire — <Link href="/shop" className="hover:text-gold-300">keep shopping</Link>
      </p>
    </div>
  );
}

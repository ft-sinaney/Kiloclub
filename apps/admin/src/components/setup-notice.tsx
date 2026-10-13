export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-sm.webp" alt="Kilo Club" className="h-16 w-auto" />
      <h1 className="mt-6 font-display text-3xl text-white uppercase">Connect Supabase</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-300">
        The admin panel needs a database. Create a free Supabase project, run{" "}
        <code className="text-gold-300">supabase/migrations/0001_init.sql</code> in its SQL editor, then set{" "}
        <code className="text-gold-300">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="text-gold-300">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> for this app. The README walks
        through every step.
      </p>
    </div>
  );
}

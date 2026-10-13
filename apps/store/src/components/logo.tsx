import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Kilo Club home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-sm.webp" alt="" width={200} height={158} className="h-10 w-auto sm:h-11" />
      {!compact && (
        <span className="leading-none">
          <span className="text-gold block font-display text-xl tracking-wider sm:text-2xl">KILO CLUB</span>
          <span className="block text-[9px] font-semibold tracking-[0.3em] text-ink-400 uppercase">Fight for fitness</span>
        </span>
      )}
    </Link>
  );
}

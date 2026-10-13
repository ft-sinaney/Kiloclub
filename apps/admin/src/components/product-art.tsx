/**
 * Illustrated supplement tub, used until real product photos are uploaded.
 * Colours come from the category so the grid still looks like a real shop.
 */
const palettes: Record<string, [string, string]> = {
  proteins: ["#c8102e", "#5c0614"],
  creatine: ["#1f6fd1", "#0a2c5a"],
  "pre-workout": ["#e8551b", "#6b1d05"],
  bcaas: ["#2fa84f", "#0b4a1d"],
  vitamins: ["#e0a526", "#6a4508"],
  accessories: ["#d99d1c", "#3d2a05"],
};
const fallback: [string, string][] = [
  ["#8b5cf6", "#2e1065"],
  ["#14b8a6", "#063c37"],
  ["#c8102e", "#5c0614"],
];

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function wrap(text: string, max: number, lines: number): string[] {
  const words = text.toUpperCase().split(/\s+/);
  const out: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > max && line) {
      out.push(line);
      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  }
  if (line) out.push(line);
  if (out.length > lines) {
    const kept = out.slice(0, lines);
    kept[lines - 1] = kept[lines - 1].slice(0, max - 1) + "…";
    return kept;
  }
  return out;
}

export function ProductArt({
  name,
  brand,
  category,
  className = "",
}: {
  name: string;
  brand?: string | null;
  category?: string | null;
  className?: string;
}) {
  const [accent, deep] = (category && palettes[category]) || fallback[hash(name) % fallback.length];
  const id = `art-${hash(name + (brand ?? ""))}`;
  const isShaker = category === "accessories";
  const isBottle = category === "vitamins";
  const lines = wrap(name, isShaker || isBottle ? 10 : 13, 2);

  if (isShaker) {
    return (
      <svg viewBox="0 0 200 220" className={className} role="img" aria-label={name}>
        <defs>
          <linearGradient id={`${id}-b`} x1="0" x2="1">
            <stop offset="0" stopColor="#0d0d0f" />
            <stop offset="0.35" stopColor="#2a2a30" />
            <stop offset="1" stopColor="#09090a" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="206" rx="44" ry="7" fill="#000" opacity="0.5" />
        <rect x="70" y="18" width="60" height="16" rx="5" fill="#1b1b1f" />
        <rect x="64" y="30" width="72" height="26" rx="7" fill={`url(#${id}-b)`} stroke="#d99d1c" strokeOpacity="0.5" />
        <path d="M66 56h68l-6 146a8 8 0 0 1-8 7H80a8 8 0 0 1-8-7z" fill={`url(#${id}-b)`} />
        <rect x="72" y="96" width="56" height="58" fill="#d99d1c" opacity="0.92" />
        <text x="100" y="122" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="15" fill="#0c0c0e">KILO</text>
        <text x="100" y="140" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="15" fill="#0c0c0e">CLUB</text>
        <rect x="78" y="62" width="5" height="130" rx="2.5" fill="#fff" opacity="0.08" />
      </svg>
    );
  }

  const bodyX = isBottle ? 58 : 34;
  const bodyW = isBottle ? 84 : 132;
  const top = isBottle ? 70 : 58;
  const brandText = (brand ?? "").toUpperCase().slice(0, 24);
  // Shrink long brand names so they stay on the tub.
  const brandSize = Math.min(isBottle ? 8 : 10, ((bodyW - 18) / Math.max(brandText.length, 1) - 1.2) / 0.74);
  const nameSize = isBottle ? 14 : 19;

  return (
    <svg viewBox="0 0 200 220" className={className} role="img" aria-label={name}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1">
          <stop offset="0" stopColor="#050506" />
          <stop offset="0.3" stopColor="#2b2b31" />
          <stop offset="0.55" stopColor="#141417" />
          <stop offset="1" stopColor="#030304" />
        </linearGradient>
        <linearGradient id={`${id}-label`} x1="0" x2="1">
          <stop offset="0" stopColor={deep} />
          <stop offset="0.35" stopColor={accent} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
        <linearGradient id={`${id}-lid`} x1="0" x2="1">
          <stop offset="0" stopColor="#0a0a0b" />
          <stop offset="0.4" stopColor="#3a3a42" />
          <stop offset="1" stopColor="#0a0a0b" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="207" rx={bodyW / 2 + 6} ry="8" fill="#000" opacity="0.55" />
      <rect x={bodyX + 8} y={top - 30} width={bodyW - 16} height="34" rx="8" fill={`url(#${id}-lid)`} />
      <rect x={bodyX + 8} y={top - 6} width={bodyW - 16} height="4" fill="#000" opacity="0.5" />
      <rect x={bodyX} y={top} width={bodyW} height={202 - top} rx="16" fill={`url(#${id}-body)`} />
      <rect x={bodyX} y={top + 52} width={bodyW} height={isBottle ? 64 : 76} fill={`url(#${id}-label)`} />
      <rect x={bodyX} y={top + 52} width={bodyW} height="3" fill="#000" opacity="0.35" />
      {brand && (
        <text
          x="100"
          y={top + 32}
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize={brandSize}
          letterSpacing="1.2"
          fill="#e7e7ea"
        >
          {brandText}
        </text>
      )}
      {lines.map((line, i) => (
        <text
          key={i}
          x="100"
          y={top + 52 + (isBottle ? 30 : 34) + i * (isBottle ? 18 : 24) - (lines.length - 1) * (isBottle ? 8 : 11)}
          textAnchor="middle"
          fontFamily="Anton, Impact, sans-serif"
          fontSize={nameSize}
          fill="#fff"
        >
          {line}
        </text>
      ))}
      <rect x={bodyX + 14} y={top + 8} width="7" height={190 - top} rx="3.5" fill="#fff" opacity="0.07" />
    </svg>
  );
}

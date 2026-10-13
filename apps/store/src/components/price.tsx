import { discountPercent, formatINR } from "@kiloclub/shared";

export function Price({
  price,
  mrp,
  from = false,
  size = "md",
}: {
  price: number;
  mrp?: number | null;
  from?: boolean;
  size?: "md" | "lg";
}) {
  const off = discountPercent(price, mrp);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      {from && <span className="text-xs text-ink-400">from</span>}
      <span className={`font-bold text-white ${size === "lg" ? "text-3xl" : "text-lg"}`}>{formatINR(price)}</span>
      {off > 0 && mrp && (
        <>
          <span className={`text-ink-500 line-through ${size === "lg" ? "text-base" : "text-xs"}`}>{formatINR(mrp)}</span>
          <span className={`font-semibold text-gold-400 ${size === "lg" ? "text-sm" : "text-xs"}`}>{off}% off</span>
        </>
      )}
    </div>
  );
}

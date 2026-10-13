"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "./providers/wishlist";
import { useSettings } from "./providers/settings";

export function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { ids, toggle } = useWishlist();
  const { isDemo } = useSettings();
  if (isDemo) return null;
  const saved = ids.has(productId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggle(productId);
      }}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={`grid size-9 place-items-center rounded-full border border-ink-600 bg-ink-900/80 backdrop-blur transition hover:border-gold-500 ${className}`}
    >
      <Heart className={`size-4 ${saved ? "fill-gold-400 text-gold-400" : "text-ink-200"}`} />
    </button>
  );
}

"use client";

import { useState } from "react";
import type { Category, Product } from "@kiloclub/shared";
import { ProductCard } from "./product-card";

export function BestSellers({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [active, setActive] = useState<string>("all");
  const used = categories.filter((c) => products.some((p) => p.category?.slug === c.slug));
  const shown = (active === "all" ? products : products.filter((p) => p.category?.slug === active)).slice(0, 8);

  return (
    <>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {[{ slug: "all", name: "All" }, ...used].map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setActive(c.slug)}
            className={`chip shrink-0 ${active === c.slug ? "chip-active" : ""}`}
            aria-pressed={active === c.slug}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { formatINR, fullProductName, priceRange, type Category, type Product } from "@kiloclub/shared";
import { deleteProduct, setProductActive } from "@/lib/actions";
import { ProductArt } from "./product-art";
import { Switch } from "./switch";

export function ProductsTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => {
      if (category && p.category_id !== category) return false;
      if (status === "active" && !p.is_active) return false;
      if (status === "hidden" && p.is_active) return false;
      if (needle && !fullProductName(p).toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [products, q, category, status]);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Something went wrong");
    });
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap gap-3 border-b border-ink-700 p-4">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-500" />
          <input className="input pl-9" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Any status</option>
          <option value="active">Live</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
      {error && <p className="border-b border-ink-700 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-ink-900 text-left text-xs tracking-wide text-ink-400 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Variants</th>
              <th className="px-4 py-3 font-medium">Live</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {rows.map((p) => {
              const range = priceRange(p);
              const outOfStock = p.variants.filter((v) => !v.in_stock).length;
              return (
                <tr key={p.id} className={`transition hover:bg-ink-800/50 ${p.is_active ? "" : "opacity-60"}`}>
                  <td className="px-4 py-3">
                    <Link href={`/products/${p.id}`} className="flex items-center gap-3">
                      <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-ink-900 p-1">
                        {p.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt="" className="size-full object-contain" />
                        ) : (
                          <ProductArt name={p.name} brand={p.brand?.name} category={p.category?.slug} className="size-full" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-white hover:text-gold-300">{p.name}</span>
                        <span className="block text-xs text-ink-500">
                          {p.brand?.name ?? "No brand"}
                          {p.is_featured && <span className="ml-2 text-gold-400">★ Best seller</span>}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-300">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-200 tabular-nums">
                    {range ? (range.min === range.max ? formatINR(range.min) : `${formatINR(range.min)} – ${formatINR(range.max)}`) : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-300">
                    {p.variants.length}
                    {outOfStock > 0 && <span className="ml-2 text-xs text-red-400">{outOfStock} out of stock</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={p.is_active}
                      disabled={pending}
                      label={`${p.is_active ? "Hide" : "Show"} ${p.name}`}
                      onChange={(value) => run(() => setProductActive(p.id, value))}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/products/${p.id}`} aria-label={`Edit ${p.name}`} className="grid size-9 place-items-center rounded-lg text-ink-300 hover:bg-ink-700 hover:text-gold-300">
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        type="button"
                        aria-label={`Delete ${p.name}`}
                        disabled={pending}
                        className="grid size-9 place-items-center rounded-lg text-ink-300 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => {
                          if (confirm(`Delete "${fullProductName(p)}"? This can't be undone.`)) run(() => deleteProduct(p.id));
                        }}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-12 text-center text-sm text-ink-500">No products match.</p>}
      </div>
    </div>
  );
}

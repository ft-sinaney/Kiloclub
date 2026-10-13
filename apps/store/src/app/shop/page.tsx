import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX, X } from "lucide-react";
import { PriceNotice } from "@/components/price-notice";
import { ProductCard } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";
import { filterProducts, getBrands, getCategories, getProducts, type SortKey } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop supplements" };

type Search = { q?: string; category?: string; brand?: string; offers?: string; sort?: string };

function hrefWith(current: Search, patch: Partial<Search>) {
  const merged = { ...current, ...patch };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) if (value) params.set(key, value);
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const raw = await searchParams;
  const search: Search = {
    q: typeof raw.q === "string" ? raw.q : undefined,
    category: typeof raw.category === "string" ? raw.category : undefined,
    brand: typeof raw.brand === "string" ? raw.brand : undefined,
    offers: raw.offers === "1" ? "1" : undefined,
    sort: typeof raw.sort === "string" ? raw.sort : undefined,
  };

  const [products, categories, brands] = await Promise.all([getProducts(), getCategories(), getBrands()]);
  const results = filterProducts(products, {
    q: search.q,
    category: search.category,
    brand: search.brand,
    offers: search.offers === "1",
    sort: search.sort as SortKey | undefined,
  });

  const category = categories.find((c) => c.slug === search.category);
  const brand = brands.find((b) => b.slug === search.brand);
  const title = search.q ? `Results for “${search.q}”` : search.offers ? "Offers" : (category?.name ?? brand?.name ?? "All supplements");
  const brandsInUse = brands.filter((b) => products.some((p) => p.brand_id === b.id));
  const hasFilters = Boolean(search.q || search.category || search.brand || search.offers);

  const filterLink = (active: boolean, href: string, label: string) => (
    <Link
      key={href + label}
      href={href}
      scroll={false}
      className={`block rounded-lg px-3 py-2 text-sm transition ${active ? "bg-gold-400/10 font-semibold text-gold-300" : "text-ink-300 hover:bg-ink-800 hover:text-white"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <nav className="text-xs text-ink-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gold-300">Home</Link> <span className="mx-1.5">/</span> <span className="text-ink-300">Shop</span>
      </nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-white uppercase sm:text-5xl">{title}</h1>
          <p className="mt-1 text-sm text-ink-400">
            {results.length} {results.length === 1 ? "product" : "products"}
          </p>
        </div>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>
      <PriceNotice className="mt-3" />

      {/* Mobile category chips */}
      <div className="scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 lg:hidden">
        <Link href={hrefWith(search, { category: undefined })} scroll={false} className={`chip shrink-0 ${!search.category ? "chip-active" : ""}`}>All</Link>
        {categories.map((c) => (
          <Link key={c.id} href={hrefWith(search, { category: c.slug })} scroll={false} className={`chip shrink-0 ${search.category === c.slug ? "chip-active" : ""}`}>
            {c.name}
          </Link>
        ))}
        <Link href={hrefWith(search, { offers: search.offers ? undefined : "1" })} scroll={false} className={`chip shrink-0 ${search.offers ? "chip-active" : ""}`}>
          Offers
        </Link>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden space-y-8 lg:block">
          <div>
            <h2 className="mb-2 px-3 text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">Category</h2>
            {filterLink(!search.category, hrefWith(search, { category: undefined }), "All categories")}
            {categories.map((c) => filterLink(search.category === c.slug, hrefWith(search, { category: c.slug }), c.name))}
          </div>
          {brandsInUse.length > 0 && (
            <div>
              <h2 className="mb-2 px-3 text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">Brand</h2>
              {filterLink(!search.brand, hrefWith(search, { brand: undefined }), "All brands")}
              {brandsInUse.map((b) => filterLink(search.brand === b.slug, hrefWith(search, { brand: b.slug }), b.name))}
            </div>
          )}
          <div>
            <h2 className="mb-2 px-3 text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">Deals</h2>
            {filterLink(Boolean(search.offers), hrefWith(search, { offers: search.offers ? undefined : "1" }), "On offer")}
          </div>
        </aside>

        <div>
          {hasFilters && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {search.q && <ActiveFilter label={`“${search.q}”`} href={hrefWith(search, { q: undefined })} />}
              {category && <ActiveFilter label={category.name} href={hrefWith(search, { category: undefined })} />}
              {brand && <ActiveFilter label={brand.name} href={hrefWith(search, { brand: undefined })} />}
              {search.offers && <ActiveFilter label="On offer" href={hrefWith(search, { offers: undefined })} />}
              <Link href="/shop" className="text-xs text-ink-400 underline-offset-4 hover:text-gold-300 hover:underline">
                Clear all
              </Link>
            </div>
          )}

          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center px-6 py-16 text-center">
              <SearchX className="size-10 text-ink-500" />
              <p className="mt-4 font-semibold text-white">No products found</p>
              <p className="mt-1 text-sm text-ink-400">Try another search, or ask us on WhatsApp — we may still have it.</p>
              <Link href="/shop" className="btn-outline mt-6 py-2.5">See all products</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActiveFilter({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} scroll={false} className="flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-400/10 px-3 py-1 text-xs text-gold-200 hover:border-gold-400">
      {label} <X className="size-3" />
    </Link>
  );
}

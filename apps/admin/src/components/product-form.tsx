"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import { discountPercent, slugify, type Brand, type Category, type Highlight, type Product } from "@kiloclub/shared";
import { deleteProduct, saveProduct, type ProductInput } from "@/lib/actions";
import { ImagePicker } from "./image-picker";
import { Switch } from "./switch";

type VariantRow = ProductInput["variants"][number] & { key: string };

let keyCounter = 0;
const newKey = () => `row-${++keyCounter}`;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-semibold text-white">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-ink-400">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ProductForm({ product, categories, brands }: { product?: Product; categories: Category[]; brands: Brand[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [brandId, setBrandId] = useState(product?.brand_id ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [highlights, setHighlights] = useState<Highlight[]>(product?.highlights?.length ? product.highlights : []);
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.length
      ? product.variants.map((v) => ({
          key: v.id,
          id: v.id,
          size: v.size,
          flavour: v.flavour ?? "",
          price: v.price,
          mrp: v.mrp ?? "",
          in_stock: v.in_stock,
        }))
      : [{ key: newKey(), size: "", flavour: "", price: "", mrp: "", in_stock: true }],
  );
  const [genSizes, setGenSizes] = useState("");
  const [genFlavours, setGenFlavours] = useState("");

  const updateVariant = (key: string, patch: Partial<VariantRow>) =>
    setVariants((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  function generate() {
    const sizes = genSizes.split(",").map((s) => s.trim()).filter(Boolean);
    const flavours = genFlavours.split(",").map((s) => s.trim()).filter(Boolean);
    if (sizes.length === 0) return;
    setVariants((rows) => {
      const existing = rows.filter((r) => r.size || r.price !== "");
      const result = [...existing];
      for (const size of sizes) {
        const sameSize = existing.find((r) => r.size.toLowerCase() === size.toLowerCase());
        for (const flavour of flavours.length ? flavours : [""]) {
          const exists = result.some((r) => r.size.toLowerCase() === size.toLowerCase() && r.flavour.toLowerCase() === flavour.toLowerCase());
          if (!exists) {
            result.push({ key: newKey(), size, flavour, price: sameSize?.price ?? "", mrp: sameSize?.mrp ?? "", in_stock: true });
          }
        }
      }
      return result;
    });
    setGenSizes("");
    setGenFlavours("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveProduct({
        id: product?.id,
        name,
        slug,
        brand_id: brandId || null,
        category_id: categoryId || null,
        description,
        badge,
        is_active: isActive,
        is_featured: isFeatured,
        images,
        highlights,
        variants: variants.map(({ key: _key, ...v }) => v),
      });
      if (!result.ok) {
        setError(result.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push("/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/products" className="flex items-center gap-1 text-xs text-ink-400 hover:text-gold-300">
            <ArrowLeft className="size-3.5" /> All products
          </Link>
          <h1 className="mt-2 font-display text-3xl tracking-wide text-white uppercase sm:text-4xl">
            {product ? "Edit product" : "New product"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/products" className="btn-outline">Cancel</Link>
          <button type="submit" disabled={pending} className="btn-gold">
            {pending && <Loader2 className="size-4 animate-spin" />} Save product
          </button>
        </div>
      </div>

      {error && <p className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Section title="Basic details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Product name *">
                  <input
                    className="input"
                    required
                    value={name}
                    placeholder="e.g. Gold Standard 100% Whey"
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slugTouched) setSlug(slugify(e.target.value));
                    }}
                  />
                </Field>
              </div>
              <Field label="Brand">
                <select className="input" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                  <option value="">— No brand —</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
              <Field label="Category">
                <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">— No category —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="URL slug" hint={`Store link: /product/${slug || "…"}`}>
                  <input
                    className="input"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea className="input min-h-28" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What it is, who it's for, how to use it…" />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Images" description="The first image is the main photo. Big photos are resized automatically.">
            <ImagePicker images={images} onChange={setImages} folder="products" />
          </Section>

          <Section title="Sizes, flavours & prices" description="Each row is one option customers can pick. Price is what you charge; MRP (optional) shows as a strike-through.">
            <div className="mb-5 rounded-xl border border-ink-700 bg-ink-900 p-4">
              <p className="flex items-center gap-2 text-xs font-medium text-gold-300">
                <Wand2 className="size-3.5" /> Quick add — every size × flavour combination
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input className="input" placeholder="Sizes: 1 kg, 2 kg" value={genSizes} onChange={(e) => setGenSizes(e.target.value)} />
                <input className="input" placeholder="Flavours: Chocolate, Vanilla" value={genFlavours} onChange={(e) => setGenFlavours(e.target.value)} />
                <button type="button" onClick={generate} className="btn-outline py-2.5">Add rows</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs text-ink-400">
                  <tr>
                    <th className="pb-2 font-medium">Size *</th>
                    <th className="pb-2 font-medium">Flavour</th>
                    <th className="pb-2 font-medium">Price (₹) *</th>
                    <th className="pb-2 font-medium">MRP (₹)</th>
                    <th className="pb-2 font-medium">In stock</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => {
                    const off = discountPercent(Number(v.price), v.mrp === "" ? null : Number(v.mrp));
                    return (
                      <tr key={v.key}>
                        <td className="py-1.5 pr-2"><input className="input" value={v.size} placeholder="1 kg" onChange={(e) => updateVariant(v.key, { size: e.target.value })} aria-label="Size" /></td>
                        <td className="py-1.5 pr-2"><input className="input" value={v.flavour} placeholder="Chocolate" onChange={(e) => updateVariant(v.key, { flavour: e.target.value })} aria-label="Flavour" /></td>
                        <td className="py-1.5 pr-2"><input className="input w-28" type="number" min="0" step="1" inputMode="numeric" value={v.price} onChange={(e) => updateVariant(v.key, { price: e.target.value })} aria-label="Price" /></td>
                        <td className="py-1.5 pr-2">
                          <div className="flex items-center gap-2">
                            <input className="input w-28" type="number" min="0" step="1" inputMode="numeric" value={v.mrp} onChange={(e) => updateVariant(v.key, { mrp: e.target.value })} aria-label="MRP" />
                            {off > 0 && <span className="text-xs whitespace-nowrap text-gold-400">{off}% off</span>}
                          </div>
                        </td>
                        <td className="py-1.5 pr-2"><Switch checked={v.in_stock} onChange={(value) => updateVariant(v.key, { in_stock: value })} label="In stock" /></td>
                        <td className="py-1.5 text-right">
                          <button
                            type="button"
                            aria-label="Remove row"
                            disabled={variants.length === 1}
                            onClick={() => setVariants((rows) => rows.filter((r) => r.key !== v.key))}
                            className="grid size-9 place-items-center rounded-lg text-ink-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => setVariants((rows) => [...rows, { key: newKey(), size: "", flavour: "", price: "", mrp: "", in_stock: true }])}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-gold-300 hover:text-gold-200"
            >
              <Plus className="size-4" /> Add row
            </button>
          </Section>

          <Section title="Highlights" description="Up to 6 key facts shown as tiles, e.g. Protein · 24g">
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input" placeholder="Label (Protein)" value={h.label} onChange={(e) => setHighlights((list) => list.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  <input className="input" placeholder="Value (24g)" value={h.value} onChange={(e) => setHighlights((list) => list.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
                  <button type="button" aria-label="Remove highlight" onClick={() => setHighlights((list) => list.filter((_, j) => j !== i))} className="grid size-10 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            {highlights.length < 6 && (
              <button type="button" onClick={() => setHighlights((list) => [...list, { label: "", value: "" }])} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-gold-300 hover:text-gold-200">
                <Plus className="size-4" /> Add highlight
              </button>
            )}
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Visibility">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Live on store</p>
                  <p className="text-xs text-ink-400">Hidden products can&apos;t be seen by customers.</p>
                </div>
                <Switch checked={isActive} onChange={setIsActive} label="Live on store" />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Best seller</p>
                  <p className="text-xs text-ink-400">Show in the Best Sellers section on the home page.</p>
                </div>
                <Switch checked={isFeatured} onChange={setIsFeatured} label="Best seller" />
              </div>
              <Field label="Badge" hint="Short label on the product photo, e.g. Bestseller, New, Hot deal">
                <input className="input" maxLength={30} value={badge} onChange={(e) => setBadge(e.target.value)} />
              </Field>
            </div>
          </Section>

          {product && (
            <Section title="Danger zone">
              <button
                type="button"
                disabled={pending}
                className="btn w-full border border-red-500/40 text-red-300 hover:bg-red-500/10"
                onClick={() => {
                  if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
                  startTransition(async () => {
                    const result = await deleteProduct(product.id);
                    if (!result.ok) return setError(result.error);
                    router.push("/products");
                    router.refresh();
                  });
                }}
              >
                <Trash2 className="size-4" /> Delete product
              </button>
            </Section>
          )}
        </div>
      </div>
    </form>
  );
}

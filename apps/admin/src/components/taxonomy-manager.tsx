"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { slugify } from "@kiloclub/shared";
import { deleteTaxonomy, saveTaxonomy, type TaxonomyInput } from "@/lib/actions";
import { ImagePicker } from "./image-picker";

export interface TaxonomyRow {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
  count: number;
}

const empty: TaxonomyInput = { name: "", slug: "", description: "", image_url: null, sort_order: 0 };

export function TaxonomyManager({ kind, rows }: { kind: "categories" | "brands"; rows: TaxonomyRow[] }) {
  const isCategory = kind === "categories";
  const noun = isCategory ? "category" : "brand";
  const [form, setForm] = useState<TaxonomyInput | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function open(row?: TaxonomyRow) {
    setError(null);
    setSlugTouched(Boolean(row));
    setForm(
      row
        ? { id: row.id, name: row.name, slug: row.slug, description: row.description ?? "", image_url: row.image_url ?? null, sort_order: row.sort_order ?? 0 }
        : { ...empty, sort_order: rows.length + 1 },
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    startTransition(async () => {
      const result = await saveTaxonomy(kind, form);
      if (!result.ok) return setError(result.error);
      setForm(null);
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-700 p-4">
          <p className="text-sm text-ink-400">{rows.length} {rows.length === 1 ? noun : kind}</p>
          <button type="button" onClick={() => open()} className="btn-gold py-2">
            <Plus className="size-4" /> Add {noun}
          </button>
        </div>
        {error && !form && <p className="bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}
        <ul className="divide-y divide-ink-700">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-4 px-4 py-3">
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink-900 text-xs font-bold text-gold-400">
                {row.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.image_url} alt="" className="size-full object-contain" />
                ) : (
                  row.name.slice(0, 2).toUpperCase()
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{row.name}</p>
                <p className="truncate text-xs text-ink-500">
                  /{row.slug} · {row.count} {row.count === 1 ? "product" : "products"}
                  {row.description ? ` · ${row.description}` : ""}
                </p>
              </div>
              <button type="button" aria-label={`Edit ${row.name}`} onClick={() => open(row)} className="grid size-9 place-items-center rounded-lg text-ink-300 hover:bg-ink-700 hover:text-gold-300">
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${row.name}`}
                disabled={pending}
                onClick={() => {
                  const warning = row.count > 0 ? ` ${row.count} products will be left without a ${noun}.` : "";
                  if (!confirm(`Delete ${noun} "${row.name}"?${warning}`)) return;
                  startTransition(async () => {
                    const result = await deleteTaxonomy(kind, row.id);
                    if (!result.ok) setError(result.error);
                  });
                }}
                className="grid size-9 place-items-center rounded-lg text-ink-300 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
          {rows.length === 0 && <li className="py-12 text-center text-sm text-ink-500">No {kind} yet.</li>}
        </ul>
      </div>

      {form && (
        <form onSubmit={submit} className="card h-fit space-y-4 p-5 xl:sticky xl:top-8">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">{form.id ? `Edit ${noun}` : `New ${noun}`}</h2>
            <button type="button" aria-label="Close" onClick={() => setForm(null)} className="text-ink-400 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-300">Name *</span>
            <input
              className="input"
              required
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugTouched ? form.slug : slugify(e.target.value) })}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink-300">Slug</span>
            <input className="input" value={form.slug} onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }); }} />
          </label>
          {isCategory && (
            <>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-300">Tagline</span>
                <input className="input" placeholder="e.g. Build muscle" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-300">Display order</span>
                <input className="input" type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </label>
            </>
          )}
          <div>
            <span className="mb-1.5 block text-xs font-medium text-ink-300">{isCategory ? "Image (optional)" : "Logo (optional)"}</span>
            <ImagePicker images={form.image_url ? [form.image_url] : []} onChange={(imgs) => setForm({ ...form, image_url: imgs[0] ?? null })} folder={kind} max={1} />
          </div>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <button type="submit" disabled={pending} className="btn-gold w-full">
            {pending && <Loader2 className="size-4 animate-spin" />} Save {noun}
          </button>
        </form>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { uploadImage } from "@/lib/upload";

/** Multi-image uploader. The first image is the main one shown on the store. */
export function ImagePicker({
  images,
  onChange,
  folder,
  max = 8,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  folder: string;
  max?: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const added: string[] = [];
    for (const file of Array.from(files).slice(0, max - images.length)) {
      try {
        added.push(await uploadImage(file, folder));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    onChange([...images, ...added]);
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <div key={src} className={`group relative aspect-square overflow-hidden rounded-xl border bg-ink-900 ${i === 0 ? "border-gold-400" : "border-ink-700"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="size-full object-contain p-1.5" />
            {i === 0 && <span className="bg-gold absolute bottom-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold text-ink-950">MAIN</span>}
            <div className="absolute top-1.5 right-1.5 flex gap-1">
              {i > 0 && (
                <button
                  type="button"
                  title="Make main image"
                  aria-label="Make main image"
                  onClick={() => onChange([src, ...images.filter((s) => s !== src)])}
                  className="grid size-7 place-items-center rounded-full bg-ink-950/80 text-ink-200 hover:text-gold-300"
                >
                  <Star className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                title="Remove"
                aria-label="Remove image"
                onClick={() => onChange(images.filter((s) => s !== src))}
                className="grid size-7 place-items-center rounded-full bg-ink-950/80 text-ink-200 hover:text-red-400"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-600 text-xs text-ink-400 transition hover:border-gold-400 hover:text-gold-300"
          >
            {busy ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            {busy ? "Uploading…" : "Add images"}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}

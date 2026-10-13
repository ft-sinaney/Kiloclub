"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Dumbbell, MessageCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import { defaultVariant, fullProductName, sortedVariants, uniqueValues, type Product } from "@kiloclub/shared";
import { useEnquiry } from "@/lib/use-enquiry";
import { WhatsAppIcon } from "./icons";
import { Price } from "./price";
import { PriceNotice } from "./price-notice";
import { ProductImage } from "./product-image";
import { useCart } from "./providers/cart";
import { useToast } from "./providers/toast";
import { WishlistButton } from "./wishlist-button";

export function ProductDetail({ product }: { product: Product }) {
  const variants = useMemo(() => sortedVariants(product), [product]);
  const initial = defaultVariant(product);
  const sizes = uniqueValues(variants.map((v) => v.size));
  const flavours = uniqueValues(variants.map((v) => v.flavour));

  const [size, setSize] = useState(initial?.size ?? "");
  const [flavour, setFlavour] = useState<string | null>(initial?.flavour ?? null);
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const { add } = useCart();
  const toast = useToast();
  const { forProduct } = useEnquiry();

  const variant =
    variants.find((v) => v.size === size && (v.flavour ?? null) === flavour) ?? variants.find((v) => v.size === size) ?? initial;
  const flavoursForSize = new Set(variants.filter((v) => v.size === size).map((v) => v.flavour));
  const name = fullProductName(product);

  function chooseSize(next: string) {
    setSize(next);
    const options = variants.filter((v) => v.size === next);
    if (!options.some((v) => (v.flavour ?? null) === flavour)) {
      setFlavour((options.find((v) => v.in_stock) ?? options[0])?.flavour ?? null);
    }
  }

  const enquiry = variant
    ? forProduct({
        product_id: product.id,
        variant_id: variant.id,
        name,
        brand: product.brand?.name,
        size: variant.size,
        flavour: variant.flavour,
        price: variant.price,
        qty,
      })
    : null;

  const images = product.images;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      {/* Gallery */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {images.length > 1 && (
          <div className="scrollbar-none flex gap-2 overflow-x-auto sm:flex-col">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setImageIndex(i)}
                aria-label={`Image ${i + 1}`}
                className={`size-16 shrink-0 overflow-hidden rounded-xl border bg-ink-850 p-1 sm:size-20 ${i === imageIndex ? "border-gold-400" : "border-ink-700"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-contain" />
              </button>
            ))}
          </div>
        )}
        <div className="card relative aspect-square flex-1 overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#2a2a30_0%,#111114_70%)]">
          <ProductImage product={product} src={images[imageIndex]} className="size-full p-8 sm:p-12" />
          {product.badge && (
            <span className="bg-gold absolute top-4 left-4 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide text-ink-950 uppercase">
              {product.badge}
            </span>
          )}
          <WishlistButton productId={product.id} className="absolute top-4 right-4" />
        </div>
      </div>

      {/* Info */}
      <div>
        {product.brand && <p className="text-xs font-semibold tracking-[0.25em] text-gold-400 uppercase">{product.brand.name}</p>}
        <h1 className="mt-2 text-2xl leading-tight font-bold text-white sm:text-3xl">{product.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {product.category && <span className="rounded-full bg-ink-800 px-2.5 py-1 text-ink-300">{product.category.name}</span>}
          {variant && (
            <span
              className={`rounded-full px-2.5 py-1 font-semibold ${variant.in_stock ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
            >
              {variant.in_stock ? "In stock" : "Out of stock"}
            </span>
          )}
        </div>

        {variant && (
          <div className="mt-5">
            <Price price={variant.price} mrp={variant.mrp} size="lg" />
            {variant.mrp && variant.mrp > variant.price && (
              <p className="mt-1 text-sm text-emerald-400">You save ₹{(variant.mrp - variant.price).toLocaleString("en-IN")}</p>
            )}
          </div>
        )}
        <PriceNotice className="mt-3 rounded-lg border border-gold-500/25 bg-gold-400/5 px-3 py-2" />

        {product.highlights.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-md">
            {product.highlights.slice(0, 6).map((h) => (
              <div key={h.label} className="rounded-xl border border-ink-700 bg-ink-900 px-3 py-3 text-center">
                <p className="text-lg font-bold text-white">{h.value}</p>
                <p className="text-[11px] text-ink-400">{h.label}</p>
              </div>
            ))}
          </div>
        )}

        {sizes.length > 0 && (
          <fieldset className="mt-7">
            <legend className="mb-2.5 text-sm font-semibold text-white">
              Size <span className="font-normal text-ink-400">· {size}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => chooseSize(s)}
                  aria-pressed={s === size}
                  className={`min-w-20 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    s === size ? "border-gold-400 bg-gold-400/10 text-gold-200" : "border-ink-600 text-ink-300 hover:border-ink-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {flavours.length > 0 && (
          <fieldset className="mt-5">
            <legend className="mb-2.5 text-sm font-semibold text-white">
              Flavour <span className="font-normal text-ink-400">· {flavour}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {flavours.map((f) => {
                const available = flavoursForSize.has(f);
                return (
                  <button
                    key={f}
                    type="button"
                    disabled={!available}
                    onClick={() => setFlavour(f)}
                    aria-pressed={f === flavour}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through ${
                      f === flavour ? "border-gold-400 bg-gold-400/10 text-gold-200" : "border-ink-600 text-ink-300 hover:border-ink-400"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-ink-600">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-11 place-items-center text-ink-300 hover:text-white">
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-white" aria-live="polite">{qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(99, q + 1))} className="grid size-11 place-items-center text-ink-300 hover:text-white">
              <Plus className="size-4" />
            </button>
          </div>
          {variant && (
            <button
              type="button"
              className="btn-outline h-11 flex-1 sm:flex-none"
              onClick={() => {
                add(
                  {
                    key: variant.id,
                    productId: product.id,
                    slug: product.slug,
                    name,
                    brand: product.brand?.name ?? null,
                    size: variant.size,
                    flavour: variant.flavour,
                    price: variant.price,
                    mrp: variant.mrp,
                    image: product.images[0] ?? null,
                    categorySlug: product.category?.slug ?? null,
                  },
                  qty,
                );
                toast(`Added ${qty > 1 ? `${qty} × ` : ""}${variant.size} to cart`);
              }}
            >
              <ShoppingBag className="size-4" /> Add to cart
            </button>
          )}
        </div>

        {enquiry && (
          <a {...enquiry} target="_blank" rel="noopener noreferrer" className="btn-gold mt-3 h-12 w-full text-base sm:max-w-md">
            <WhatsAppIcon className="size-5" /> Enquire on WhatsApp
          </a>
        )}

        <ul className="mt-6 grid grid-cols-3 gap-3 border-t border-ink-800 pt-6 text-center text-[11px] text-ink-400 sm:max-w-md">
          <li className="flex flex-col items-center gap-1.5"><BadgeCheck className="size-5 text-gold-400" /> 100% authentic</li>
          <li className="flex flex-col items-center gap-1.5"><MessageCircle className="size-5 text-gold-400" /> Quick WhatsApp reply</li>
          <li className="flex flex-col items-center gap-1.5"><Dumbbell className="size-5 text-gold-400" /> Expert advice</li>
        </ul>

        {product.description && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-white">About this product</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-300">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

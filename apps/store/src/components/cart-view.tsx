"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatINR } from "@kiloclub/shared";
import { useEnquiry } from "@/lib/use-enquiry";
import { WhatsAppIcon } from "./icons";
import { PriceNotice } from "./price-notice";
import { ProductArt } from "./product-art";
import { useCart } from "./providers/cart";
import { useAuth } from "./providers/auth";
import { useSettings } from "./providers/settings";

export function CartView() {
  const { items, ready, total, count, setQty, remove, clear } = useCart();
  const { forCart } = useEnquiry();
  const { user } = useAuth();
  const { isDemo } = useSettings();
  const [sent, setSent] = useState(false);

  if (!ready) return <div className="card mt-8 h-48 animate-pulse" />;

  if (items.length === 0) {
    return (
      <div className="card mt-8 flex flex-col items-center px-6 py-16 text-center">
        <ShoppingBag className="size-10 text-ink-500" />
        <p className="mt-4 font-semibold text-white">Your cart is empty</p>
        <p className="mt-1 text-sm text-ink-400">Add a few products, then enquire about all of them at once.</p>
        <Link href="/shop" className="btn-gold mt-6">Browse supplements</Link>
      </div>
    );
  }

  const enquiry = forCart(
    items.map((i) => ({
      product_id: i.productId,
      variant_id: i.key,
      name: i.name,
      brand: i.brand,
      size: i.size,
      flavour: i.flavour,
      price: i.price,
      qty: i.qty,
    })),
  );

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
      <ul className="card divide-y divide-ink-700">
        {items.map((item) => (
          <li key={item.key} className="flex gap-4 p-4">
            <Link href={`/product/${item.slug}`} className="size-20 shrink-0 overflow-hidden rounded-xl bg-ink-900 p-1.5 sm:size-24">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="size-full object-contain" />
              ) : (
                <ProductArt name={item.name.replace(item.brand ?? "", "").trim() || item.name} brand={item.brand} category={item.categorySlug} className="size-full" />
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-semibold text-white hover:text-gold-300">
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-400">{[item.size, item.flavour].filter(Boolean).join(" · ")}</p>
                </div>
                <button type="button" onClick={() => remove(item.key)} aria-label={`Remove ${item.name}`} className="text-ink-500 hover:text-red-400">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center rounded-lg border border-ink-600">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty(item.key, item.qty - 1)} className="grid size-8 place-items-center text-ink-300 hover:text-white">
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-semibold text-white">{item.qty}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQty(item.key, item.qty + 1)} className="grid size-8 place-items-center text-ink-300 hover:text-white">
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <p className="text-sm font-bold text-white">{formatINR(item.price * item.qty)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="card h-fit p-5 lg:sticky lg:top-28">
        <h2 className="text-sm font-semibold text-white">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-ink-400">
            <dt>Items</dt>
            <dd>{count}</dd>
          </div>
          <div className="flex justify-between border-t border-ink-700 pt-3 text-base">
            <dt className="font-semibold text-white">Estimated total</dt>
            <dd className="font-bold text-white">{formatINR(total)}</dd>
          </div>
        </dl>
        <PriceNotice className="mt-3" />

        <a
          href={enquiry.href}
          onClick={() => {
            enquiry.onClick();
            setSent(true);
          }}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold mt-5 h-12 w-full text-base"
        >
          <WhatsAppIcon className="size-5" /> Enquire on WhatsApp
        </a>

        <details className="mt-4 text-xs text-ink-400">
          <summary className="cursor-pointer hover:text-ink-200">Preview message</summary>
          <pre className="mt-2 rounded-lg bg-ink-900 p-3 font-sans whitespace-pre-wrap text-ink-300">{enquiry.message}</pre>
        </details>

        {!user && !isDemo && (
          <p className="mt-4 text-xs text-ink-400">
            <Link href="/login?next=/cart" className="text-gold-300 hover:underline">Log in</Link> to add your name to the message and keep a history of your enquiries.
          </p>
        )}

        {sent && (
          <div className="mt-4 rounded-lg border border-ink-700 bg-ink-900 p-3 text-xs text-ink-300">
            Sent your message on WhatsApp?{" "}
            <button type="button" onClick={() => { clear(); setSent(false); }} className="font-semibold text-gold-300 hover:underline">
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

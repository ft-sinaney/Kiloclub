"use client";

import { useState, useTransition } from "react";
import { ShoppingBag, Tag, Trash2 } from "lucide-react";
import { describeItem, formatINR, type Enquiry } from "@kiloclub/shared";
import { deleteEnquiry } from "@/lib/actions";
import { formatDateTime } from "@/lib/format";

export function EnquiriesList({ enquiries }: { enquiries: Enquiry[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (enquiries.length === 0) {
    return (
      <div className="card px-6 py-16 text-center text-sm text-ink-500">
        No enquiries yet. Every time a customer taps Enquire on the store, it&apos;s logged here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
      {enquiries.map((e) => {
        const total = e.items.reduce((sum, i) => sum + (i.price ?? 0) * (i.qty || 1), 0);
        return (
          <article key={e.id} className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{e.customer_name || e.customer_email || "Guest"}</p>
                <p className="text-xs text-ink-500">
                  {e.customer_name && e.customer_email ? `${e.customer_email} · ` : ""}
                  {formatDateTime(e.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-ink-800 px-2.5 py-1 text-xs text-ink-300">
                  {e.source === "cart" ? <ShoppingBag className="size-3" /> : <Tag className="size-3" />}
                  {e.source === "cart" ? "Cart" : "Product page"}
                </span>
                <button
                  type="button"
                  aria-label="Delete enquiry"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Delete this enquiry from the log?")) return;
                    startTransition(async () => {
                      const result = await deleteEnquiry(e.id);
                      if (!result.ok) setError(result.error);
                    });
                  }}
                  className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {e.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span className="text-ink-200">{describeItem(item)}</span>
                  {item.price != null && <span className="shrink-0 text-ink-400 tabular-nums">{formatINR(item.price * (item.qty || 1))}</span>}
                </li>
              ))}
            </ul>
            {total > 0 && (
              <p className="mt-3 flex justify-between border-t border-ink-700 pt-3 text-sm">
                <span className="text-ink-400">Estimated total (at listed prices)</span>
                <span className="font-semibold text-gold-300">{formatINR(total)}</span>
              </p>
            )}
            <details className="mt-3 text-xs text-ink-400">
              <summary className="cursor-pointer hover:text-ink-200">WhatsApp message</summary>
              <pre className="mt-2 rounded-lg bg-ink-900 p-3 font-sans whitespace-pre-wrap text-ink-300">{e.message}</pre>
            </details>
          </article>
        );
      })}
    </div>
  );
}

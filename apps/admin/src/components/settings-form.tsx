"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { buildCartMessage, buildProductMessage, type SiteSettings } from "@kiloclub/shared";
import { saveSettings } from "@/lib/actions";

const sampleItem = { name: "Optimum Nutrition Gold Standard 100% Whey", size: "2 kg", flavour: "Double Rich Chocolate", qty: 1 };
const sampleCart = [sampleItem, { name: "MuscleBlaze Creatine Monohydrate", size: "250 g", flavour: "Unflavoured", qty: 2 }];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState(settings);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (key: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStatus(null);
    setForm({ ...form, [key]: e.target.value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await saveSettings(form);
          setStatus(result.ok ? { ok: true, text: "Saved — the store uses these right away." } : { ok: false, text: result.error });
        });
      }}
      className="grid gap-5 xl:grid-cols-2"
    >
      <div className="card space-y-5 p-5 sm:p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white">WhatsApp number</span>
          <input className="input" value={form.whatsapp_number} onChange={set("whatsapp_number")} inputMode="tel" required />
          <span className="mt-1 block text-xs text-ink-500">With country code, digits only — e.g. 919037009229 for +91 90370 09229.</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white">Single product message</span>
          <textarea className="input min-h-20" value={form.product_template} onChange={set("product_template")} required />
          <span className="mt-1 block text-xs text-ink-500"><code className="text-gold-300">{"{items}"}</code> becomes the product, size and flavour.</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white">Cart message</span>
          <textarea className="input min-h-24" value={form.cart_template} onChange={set("cart_template")} required />
          <span className="mt-1 block text-xs text-ink-500"><code className="text-gold-300">{"{items}"}</code> becomes a numbered list of everything in the cart.</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white">Price notice</span>
          <input className="input" value={form.price_notice} onChange={set("price_notice")} />
          <span className="mt-1 block text-xs text-ink-500">Shown at the top of every page and next to prices. Leave empty to hide it.</span>
        </label>
        {status && (
          <p className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${status.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
            {status.ok && <CheckCircle2 className="size-4" />} {status.text}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn-gold">
          {pending && <Loader2 className="size-4 animate-spin" />} Save settings
        </button>
      </div>

      <div className="card h-fit p-5 sm:p-6">
        <h2 className="font-semibold text-white">Message preview</h2>
        <p className="mt-0.5 text-xs text-ink-400">What customers will send you on WhatsApp.</p>
        <div className="mt-5 space-y-4 rounded-xl bg-[#0b141a] p-4">
          {[buildProductMessage(form.product_template, sampleItem), buildCartMessage(form.cart_template, sampleCart, "Rahul")].map((text, i) => (
            <div key={i} className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#005c4b] px-3 py-2 text-sm whitespace-pre-wrap text-white shadow">
              {text}
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-4xl text-white uppercase sm:text-5xl">Your cart</h1>
      <p className="mt-1 text-sm text-ink-400">Send everything in one WhatsApp message and we&apos;ll confirm availability.</p>
      <CartView />
    </div>
  );
}

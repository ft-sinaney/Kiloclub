"use client";

import { useCallback } from "react";
import { buildCartMessage, buildProductMessage, whatsappLink, type EnquiryItem } from "@kiloclub/shared";
import { useAuth } from "@/components/providers/auth";
import { useSettings } from "@/components/providers/settings";

/** Saves the enquiry for the admin panel. Fire-and-forget so WhatsApp opens instantly. */
function logEnquiry(payload: { items: EnquiryItem[]; message: string; source: "product" | "cart" }) {
  try {
    fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // never block the WhatsApp hand-off
  }
}

/**
 * Builds WhatsApp links for one product or the whole cart.
 * Use the returned `href` on an <a target="_blank"> and call `onClick` to log it —
 * a real link (not window.open after an await) is never blocked as a popup on phones.
 */
export function useEnquiry() {
  const { settings } = useSettings();
  const { user } = useAuth();

  const forProduct = useCallback(
    (item: EnquiryItem) => {
      const message = buildProductMessage(settings.product_template, item, user?.name);
      return {
        href: whatsappLink(settings.whatsapp_number, message),
        onClick: () => logEnquiry({ items: [item], message, source: "product" }),
      };
    },
    [settings, user?.name],
  );

  const forCart = useCallback(
    (items: EnquiryItem[]) => {
      const message = buildCartMessage(settings.cart_template, items, user?.name);
      return {
        href: whatsappLink(settings.whatsapp_number, message),
        message,
        onClick: () => logEnquiry({ items, message, source: "cart" }),
      };
    },
    [settings, user?.name],
  );

  return { forProduct, forCart };
}

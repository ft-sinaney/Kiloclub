import type { EnquiryItem } from "./types";

/** "2 x Optimum Nutrition Gold Standard Whey – 2kg (Chocolate)" */
export function describeItem(item: Pick<EnquiryItem, "name" | "size" | "flavour" | "qty">): string {
  const qty = item.qty > 1 ? `${item.qty} x ` : "";
  const flavour = item.flavour ? ` (${item.flavour})` : "";
  return `${qty}${item.name} – ${item.size}${flavour}`;
}

function withName(message: string, customerName?: string | null): string {
  const name = customerName?.trim();
  return name ? `${message}\n\n- ${name}` : message;
}

/** Message for a single product enquiry, from the product page or a card. */
export function buildProductMessage(
  template: string,
  item: Pick<EnquiryItem, "name" | "size" | "flavour" | "qty">,
  customerName?: string | null,
): string {
  return withName(template.replace(/\{items?\}/g, describeItem(item)), customerName);
}

/** Message for the whole enquiry cart — one numbered line per product. */
export function buildCartMessage(
  template: string,
  items: Pick<EnquiryItem, "name" | "size" | "flavour" | "qty">[],
  customerName?: string | null,
): string {
  const list = items.map((item, i) => `${i + 1}. ${describeItem(item)}`).join("\n");
  return withName(template.replace(/\{items?\}/g, list), customerName);
}

/** wa.me link that opens a chat with the message pre-typed. */
export function whatsappLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

import type { Product, Variant } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value: number): string {
  return inr.format(Math.round(value));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function discountPercent(price: number, mrp: number | null | undefined): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Variants in display order. */
export function sortedVariants(product: Pick<Product, "variants">): Variant[] {
  return [...(product.variants ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order || a.price - b.price,
  );
}

/** The variant shown by default: first in-stock one, else the first. */
export function defaultVariant(product: Pick<Product, "variants">): Variant | undefined {
  const variants = sortedVariants(product);
  return variants.find((v) => v.in_stock) ?? variants[0];
}

export function priceRange(product: Pick<Product, "variants">): { min: number; max: number } | null {
  const prices = (product.variants ?? []).map((v) => Number(v.price));
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function bestDiscount(product: Pick<Product, "variants">): number {
  return Math.max(0, ...(product.variants ?? []).map((v) => discountPercent(Number(v.price), v.mrp)));
}

export function uniqueValues<T>(values: (T | null | undefined)[]): T[] {
  return [...new Set(values.filter((v): v is T => v !== null && v !== undefined && v !== ""))];
}

export function isInStock(product: Pick<Product, "variants">): boolean {
  return (product.variants ?? []).some((v) => v.in_stock);
}

/** Brand + product name, without repeating the brand ("Kilo Club Shaker Bottle"). */
export function fullProductName(product: { name: string; brand?: { name: string } | null }): string {
  const brand = product.brand?.name?.trim();
  if (!brand || product.name.toLowerCase().startsWith(brand.toLowerCase())) return product.name;
  return `${brand} ${product.name}`;
}

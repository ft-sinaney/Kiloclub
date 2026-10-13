import { cache } from "react";
import {
  DEFAULT_SETTINGS,
  PRODUCT_SELECT,
  bestDiscount,
  demoBrands,
  demoCategories,
  demoProducts,
  priceRange,
  type Brand,
  type Category,
  type Product,
  type SiteSettings,
} from "@kiloclub/shared";
import { isSupabaseConfigured } from "@kiloclub/shared/supabase/config";
import { createPublicClient } from "@kiloclub/shared/supabase/server";

/** True while the store runs on the built-in sample catalogue. */
export const isDemoMode = !isSupabaseConfigured;

function normalizeProduct(row: Product): Product {
  return {
    ...row,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    images: row.images ?? [],
    variants: (row.variants ?? []).map((v) => ({
      ...v,
      price: Number(v.price),
      mrp: v.mrp == null ? null : Number(v.mrp),
    })),
  };
}

export const getProducts = cache(async (): Promise<Product[]> => {
  if (isDemoMode) return demoProducts;
  const { data, error } = await createPublicClient()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load products", error.message);
    return [];
  }
  return (data as Product[]).map(normalizeProduct);
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (isDemoMode) return demoCategories;
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) console.error("Failed to load categories", error.message);
  return (data as Category[]) ?? [];
});

export const getBrands = cache(async (): Promise<Brand[]> => {
  if (isDemoMode) return demoBrands;
  const { data, error } = await createPublicClient().from("brands").select("*").order("name");
  if (error) console.error("Failed to load brands", error.message);
  return (data as Brand[]) ?? [];
});

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (isDemoMode) return DEFAULT_SETTINGS;
  const { data } = await createPublicClient()
    .from("site_settings")
    .select("whatsapp_number, product_template, cart_template, price_notice")
    .eq("id", 1)
    .maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) };
});

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "discount";

export interface ProductFilters {
  q?: string;
  category?: string;
  brand?: string;
  offers?: boolean;
  sort?: SortKey;
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const q = filters.q?.trim().toLowerCase();
  let list = products.filter((p) => {
    if (filters.category && p.category?.slug !== filters.category) return false;
    if (filters.brand && p.brand?.slug !== filters.brand) return false;
    if (filters.offers && bestDiscount(p) === 0) return false;
    if (q) {
      const haystack = [p.name, p.brand?.name, p.category?.name, p.description, ...p.variants.map((v) => v.flavour)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!q.split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  });

  const min = (p: Product) => priceRange(p)?.min ?? 0;
  switch (filters.sort) {
    case "price-asc":
      list = list.sort((a, b) => min(a) - min(b));
      break;
    case "price-desc":
      list = list.sort((a, b) => min(b) - min(a));
      break;
    case "discount":
      list = list.sort((a, b) => bestDiscount(b) - bestDiscount(a));
      break;
    case "newest":
      list = list.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
    default:
      list = list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }
  return list;
}

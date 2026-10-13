import { PRODUCT_SELECT, type Brand, type Category, type Product } from "@kiloclub/shared";
import type { SupabaseClient } from "@supabase/supabase-js";

export function normalizeProduct(row: Product): Product {
  return {
    ...row,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    images: row.images ?? [],
    variants: [...(row.variants ?? [])]
      .map((v) => ({ ...v, price: Number(v.price), mrp: v.mrp == null ? null : Number(v.mrp) }))
      .sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function loadTaxonomies(supabase: SupabaseClient) {
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("brands").select("*").order("name"),
  ]);
  return { categories: (categories as Category[]) ?? [], brands: (brands as Brand[]) ?? [] };
}

export async function loadProducts(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Product[]).map(normalizeProduct);
}

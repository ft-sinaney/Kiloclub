import { notFound } from "next/navigation";
import { PRODUCT_SELECT, type Product } from "@kiloclub/shared";
import { ProductForm } from "@/components/product-form";
import { requireAdmin } from "@/lib/auth";
import { loadTaxonomies, normalizeProduct } from "@/lib/data";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ data }, { categories, brands }] = await Promise.all([
    supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle(),
    loadTaxonomies(supabase),
  ]);
  if (!data) notFound();
  return <ProductForm product={normalizeProduct(data as Product)} categories={categories} brands={brands} />;
}

import { ProductForm } from "@/components/product-form";
import { requireAdmin } from "@/lib/auth";
import { loadTaxonomies } from "@/lib/data";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { categories, brands } = await loadTaxonomies(supabase);
  return <ProductForm categories={categories} brands={brands} />;
}

import type { Category } from "@kiloclub/shared";
import { PageHeader } from "@/components/page-header";
import { TaxonomyManager } from "@/components/taxonomy-manager";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    supabase.from("products").select("category_id"),
  ]);
  const rows = ((categories as Category[]) ?? []).map((c) => ({
    ...c,
    count: (products ?? []).filter((p) => p.category_id === c.id).length,
  }));
  return (
    <>
      <PageHeader title="Categories" description="Sections customers browse by on the store." />
      <TaxonomyManager kind="categories" rows={rows} />
    </>
  );
}

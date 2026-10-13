import type { Brand } from "@kiloclub/shared";
import { PageHeader } from "@/components/page-header";
import { TaxonomyManager } from "@/components/taxonomy-manager";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Brands" };

export default async function BrandsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: brands }, { data: products }] = await Promise.all([
    supabase.from("brands").select("*").order("name"),
    supabase.from("products").select("brand_id"),
  ]);
  const rows = ((brands as Brand[]) ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    image_url: b.logo_url,
    count: (products ?? []).filter((p) => p.brand_id === b.id).length,
  }));
  return (
    <>
      <PageHeader title="Brands" description="Shown on products and in the brands strip on the home page." />
      <TaxonomyManager kind="brands" rows={rows} />
    </>
  );
}

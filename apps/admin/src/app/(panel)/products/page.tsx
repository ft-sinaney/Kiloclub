import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProductsTable } from "@/components/products-table";
import { requireAdmin } from "@/lib/auth";
import { loadProducts, loadTaxonomies } from "@/lib/data";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const { supabase } = await requireAdmin();
  const [products, { categories }] = await Promise.all([loadProducts(supabase), loadTaxonomies(supabase)]);
  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products in your catalogue`}
        action={
          <Link href="/products/new" className="btn-gold">
            <Plus className="size-4" /> Add product
          </Link>
        }
      />
      <ProductsTable products={products} categories={categories} />
    </>
  );
}

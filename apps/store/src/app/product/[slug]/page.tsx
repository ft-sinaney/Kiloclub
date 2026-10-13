import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fullProductName } from "@kiloclub/shared";
import { ProductCard } from "@/components/product-card";
import { ProductDetail } from "@/components/product-detail";
import { SectionHeader } from "@/components/section-header";
import { getProductBySlug, getProducts } from "@/lib/catalog";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: fullProductName(product),
    description: product.description?.slice(0, 160) ?? undefined,
    openGraph: product.images[0] ? { images: [product.images[0]] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts())
    .filter((p) => p.id !== product.id && p.category_id && p.category_id === product.category_id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <nav className="mb-6 flex flex-wrap gap-x-1.5 text-xs text-ink-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gold-300">Home</Link>
        <span>/</span>
        {product.category ? (
          <Link href={`/shop?category=${product.category.slug}`} className="hover:text-gold-300">{product.category.name}</Link>
        ) : (
          <Link href="/shop" className="hover:text-gold-300">Shop</Link>
        )}
        <span>/</span>
        <span className="text-ink-300">{product.name}</span>
      </nav>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeader title="You may also like" href={`/shop?category=${product.category?.slug}`} />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

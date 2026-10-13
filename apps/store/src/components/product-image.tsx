import type { Product } from "@kiloclub/shared";
import { ProductArt } from "./product-art";

export function ProductImage({
  product,
  src,
  className = "",
}: {
  product: Pick<Product, "name" | "brand" | "category" | "images">;
  src?: string | null;
  className?: string;
}) {
  const image = src ?? product.images[0];
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={product.name} loading="lazy" className={`object-contain ${className}`} />;
  }
  return (
    <ProductArt
      name={product.name}
      brand={product.brand?.name}
      category={product.category?.slug}
      className={className}
    />
  );
}

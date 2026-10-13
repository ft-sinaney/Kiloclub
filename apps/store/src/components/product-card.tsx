"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import {
  defaultVariant,
  fullProductName,
  isInStock,
  priceRange,
  sortedVariants,
  type Product,
} from "@kiloclub/shared";
import { useEnquiry } from "@/lib/use-enquiry";
import { WhatsAppIcon } from "./icons";
import { Price } from "./price";
import { ProductImage } from "./product-image";
import { useCart } from "./providers/cart";
import { useToast } from "./providers/toast";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const toast = useToast();
  const { forProduct } = useEnquiry();
  const variants = sortedVariants(product);
  const variant = defaultVariant(product);
  const range = priceRange(product);
  const inStock = isInStock(product);
  const sizes = new Set(variants.map((v) => v.size)).size;
  const flavours = new Set(variants.map((v) => v.flavour).filter(Boolean)).size;
  const single = variants.length === 1 ? variants[0] : null;
  const name = fullProductName(product);
  const href = `/product/${product.slug}`;

  const options = [sizes > 1 && `${sizes} sizes`, flavours > 1 && `${flavours} flavours`].filter(Boolean).join(" · ");

  return (
    <article className="group card relative flex flex-col overflow-hidden transition hover:border-gold-500/50">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#26262c_0%,#111114_70%)]">
        <ProductImage product={product} className="size-full p-5 transition duration-500 group-hover:scale-105" />
        {product.badge && (
          <span className="bg-gold absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-ink-950 uppercase">
            {product.badge}
          </span>
        )}
        {!inStock && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink-950/90 px-2.5 py-1 text-[10px] font-semibold text-ink-300 uppercase">
            Out of stock
          </span>
        )}
      </Link>
      <WishlistButton productId={product.id} className="absolute top-3 right-3" />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          {product.brand && <p className="text-[11px] font-semibold tracking-wider text-ink-400 uppercase">{product.brand.name}</p>}
          <Link href={href} className="mt-0.5 line-clamp-2 text-sm font-semibold text-white hover:text-gold-300">
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-ink-400">
            {single ? [single.size, single.flavour].filter(Boolean).join(" · ") : options || variant?.size}
          </p>
        </div>

        <div className="mt-auto">
          {range && variant && (
            <Price price={single ? single.price : range.min} mrp={single ? single.mrp : null} from={!single && range.min !== range.max} />
          )}
        </div>

        {single ? (
          <div className="flex gap-2">
            <a
              {...forProduct({
                product_id: product.id,
                variant_id: single.id,
                name,
                brand: product.brand?.name,
                size: single.size,
                flavour: single.flavour,
                price: single.price,
                qty: 1,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold flex-1 px-3 py-2.5"
            >
              <WhatsAppIcon /> Enquire
            </a>
            <button
              type="button"
              aria-label={`Add ${product.name} to cart`}
              className="btn-outline px-3 py-2.5"
              onClick={() => {
                add({
                  key: single.id,
                  productId: product.id,
                  slug: product.slug,
                  name,
                  brand: product.brand?.name ?? null,
                  size: single.size,
                  flavour: single.flavour,
                  price: single.price,
                  mrp: single.mrp,
                  image: product.images[0] ?? null,
                  categorySlug: product.category?.slug ?? null,
                });
                toast("Added to cart");
              }}
            >
              <ShoppingBag className="size-4" />
            </button>
          </div>
        ) : (
          <Link href={href} className="btn-gold px-3 py-2.5">
            Choose options
          </Link>
        )}
      </div>
    </article>
  );
}

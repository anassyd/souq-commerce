"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useProductRating } from "@/store/reviews";
import { Price } from "@/components/product/price";
import { Rating } from "@/components/product/rating";
import { WishlistButton } from "@/components/product/wishlist-button";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { CompareIconButton } from "@/components/compare/compare-button";

export function ProductCard({ product, priority, index = 0 }: { product: Product; priority?: boolean; index?: number }) {
  const second = product.images[1];
  const lowStock = product.stock > 0 && product.stock <= 5;
  const rating = useProductRating(product);
  // Cut-outs on white sit inside the tile and blend into it; lifestyle photos fill the tile.
  const fit = product.photo ? "object-cover" : "object-contain p-6 mix-blend-multiply";

  return (
    <motion.article
      className="group relative flex flex-col"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary ring-1 ring-inset ring-foreground/[0.04] transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-foreground/[0.07]">
        <Link href={`/products/${product.slug}`} className="absolute inset-0" aria-label={product.name}>
          {/* Both images stay mounted so the hover swap never waits on a download. Opacity sits on the
              images themselves (not a wrapper) so mix-blend-multiply keeps blending with the tile. */}
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn(fit, "transition duration-500 ease-out group-hover:scale-105", second && "group-hover:opacity-0")}
          />
          {second && (
            <Image
              src={second}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className={cn(fit, "scale-95 opacity-0 transition duration-500 ease-out group-hover:scale-105 group-hover:opacity-100")}
            />
          )}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.stock === 0 ? (
              <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">Sold out</span>
            ) : product.compareAtPrice ? (
              <span className="rounded-full bg-deal px-2.5 py-1 text-xs font-bold text-deal-foreground shadow-sm">-{product.discountPercent}%</span>
            ) : null}
            {rating.count > 0 && rating.value >= 4.5 && (
              <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">★ Top rated</span>
            )}
          </div>
        </Link>
        <WishlistButton productId={product.id} className="absolute right-3 top-3 transition duration-300 hover:scale-110" />
        <CompareIconButton
          item={{ id: product.id, name: product.name, image: product.thumbnail, photo: product.photo }}
          className="absolute right-3 top-14 translate-x-2 opacity-0 transition duration-300 hover:scale-110 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 [@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100"
        />
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
          <AddToCartButton
            size="sm"
            className="w-full shadow-md"
            product={{ id: product.id, slug: product.slug, name: product.name, image: product.images[0], price: product.price, stock: product.stock }}
          />
        </div>
      </div>
      <div className="mt-3 space-y-1.5 px-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{product.category.name}</p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-primary"
        >
          {product.name}
        </Link>
        <Rating value={rating.value} count={rating.count} compact />
        <Price price={product.price} compareAt={product.compareAtPrice} />
        {lowStock && <p className="text-sm font-medium text-destructive">Only {product.stock} left</p>}
      </div>
    </motion.article>
  );
}

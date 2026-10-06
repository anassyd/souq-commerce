"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, GitCompareArrows, Plus, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { fetchProductsByIds } from "@/lib/dummyjson";
import { cn, formatPrice } from "@/lib/utils";
import { useMounted } from "@/lib/use-mounted";
import { COMPARE_LIMIT, useCompare } from "@/store/compare";
import { combineRating, useReviews } from "@/store/reviews";
import { Rating } from "@/components/product/rating";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Row = {
  label: string;
  /** Comparable value used for "differences only" and for picking the best column. */
  key: (p: Product) => string | number;
  render: (p: Product) => React.ReactNode;
  best?: "min" | "max";
};

export default function ComparePage() {
  const mounted = useMounted();
  const items = useCompare((s) => s.items);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);
  const localReviews = useReviews((s) => s.reviews);
  const [diffOnly, setDiffOnly] = useState(false);
  const ids = items.map((i) => i.id);

  const { data, isLoading, isError, refetch } = useQuery<Product[]>({
    queryKey: ["compare", ids],
    enabled: mounted && ids.length > 0,
    queryFn: () => fetchProductsByIds(ids),
  });
  const products = (data ?? []).filter((p) => ids.includes(p.id));
  const rating = (p: Product) => combineRating(p, mounted ? localReviews : []);

  const rows: Row[] = [
    { label: "Price", key: (p) => p.price, best: "min", render: (p) => <span className="font-display text-2xl font-bold">{formatPrice(p.price)}</span> },
    {
      label: "Discount",
      key: (p) => (p.compareAtPrice ? p.discountPercent : 0),
      best: "max",
      render: (p) =>
        p.compareAtPrice ? (
          <span className="flex flex-col gap-0.5">
            <span className="w-fit rounded-full bg-deal px-2 py-0.5 text-xs font-bold text-deal-foreground">-{p.discountPercent}%</span>
            <span className="text-sm text-muted-foreground line-through">{formatPrice(p.compareAtPrice)}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      label: "Customer rating",
      key: (p) => Math.round(rating(p).value * 10) / 10,
      best: "max",
      render: (p) => {
        const r = rating(p);
        return <Rating value={r.value} count={r.count} className="flex-wrap" />;
      },
    },
    { label: "Reviews", key: (p) => rating(p).count, best: "max", render: (p) => <span className="tabular-nums">{rating(p).count}</span> },
    {
      label: "Availability",
      key: (p) => (p.stock === 0 ? "out" : p.stock <= 5 ? "low" : "in"),
      render: (p) =>
        p.stock === 0 ? (
          <span className="font-semibold text-destructive">Out of stock</span>
        ) : p.stock <= 5 ? (
          <span className="font-semibold text-destructive">Only {p.stock} left</span>
        ) : (
          <span className="font-semibold text-emerald-700">In stock</span>
        ),
    },
    {
      label: "Category",
      key: (p) => p.category.slug,
      render: (p) => (
        <Link href={`/products?category=${p.category.slug}`} className="rounded-full bg-secondary px-3 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
          {p.category.name}
        </Link>
      ),
    },
    { label: "Brand", key: (p) => p.brand ?? "", render: (p) => p.brand ?? <span className="text-muted-foreground">—</span> },
    { label: "About", key: (p) => p.description, render: (p) => <p className="line-clamp-5 text-sm leading-relaxed text-muted-foreground">{p.description}</p> },
  ];

  const isDifferent = (row: Row) => new Set(products.map(row.key)).size > 1;
  const bestOf = (row: Row) => {
    if (!row.best || products.length < 2 || !isDifferent(row)) return null;
    const values = products.map((p) => Number(row.key(p)));
    return row.best === "min" ? Math.min(...values) : Math.max(...values);
  };
  const visible = diffOnly ? rows.filter(isDifferent) : rows;
  const cols = `minmax(120px,160px) repeat(${Math.max(products.length, 1)}, minmax(200px, 1fr))`;

  if (!mounted || (ids.length > 0 && isLoading)) {
    return (
      <div className="container py-10">
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
        </div>
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="container py-10">
        <h1 className="text-4xl font-bold">Compare products</h1>
        <div className="mt-10 rounded-3xl bg-secondary p-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-background text-primary shadow-sm">
            <GitCompareArrows className="h-6 w-6" />
          </span>
          <p className="mt-4 font-display text-2xl font-bold">Nothing to compare yet</p>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Tap the compare icon on up to {COMPARE_LIMIT} products to see their prices, ratings and details side by side.
          </p>
          <Button asChild className="mt-6"><Link href="/products">Browse products</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Compare products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} of {COMPARE_LIMIT} selected · best values are marked with <Crown className="inline h-3.5 w-3.5 text-deal" />
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <span className="relative inline-flex">
              <input type="checkbox" className="peer sr-only" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
              <span className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform peer-checked:translate-x-5" />
            </span>
            Differences only
          </label>
          <Button variant="outline" size="sm" onClick={clear}>Clear all</Button>
        </div>
      </div>

      {isError && (
        <div className="mt-8 rounded-3xl bg-secondary p-8 text-center">
          <p className="font-semibold">Products couldn&apos;t be loaded.</p>
          <Button className="mt-4" onClick={() => refetch()}>Try again</Button>
        </div>
      )}

      <div className="no-scrollbar -mx-4 mt-8 overflow-x-auto px-4 pb-4">
        <div className="min-w-fit">
          {/* Product header row */}
          <div className="grid gap-4" style={{ gridTemplateColumns: cols }}>
            <div className="sticky left-0 z-10 bg-background" />
            <AnimatePresence initial={false} mode="popLayout">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="group relative flex flex-col"
                >
                  <button
                    onClick={() => remove(p.id)}
                    aria-label={`Remove ${p.name} from compare`}
                    className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:scale-110 hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Link href={`/products/${p.slug}`} className="relative aspect-square overflow-hidden rounded-3xl bg-secondary">
                    <Image
                      src={p.thumbnail}
                      alt={p.name}
                      fill
                      sizes="(min-width: 1024px) 22vw, 200px"
                      className={cn("transition-transform duration-500 group-hover:scale-105", p.photo ? "object-cover" : "object-contain p-6 mix-blend-multiply")}
                    />
                  </Link>
                  <Link href={`/products/${p.slug}`} className="mt-3 line-clamp-2 min-h-[3rem] font-semibold leading-snug hover:text-primary">
                    {p.name}
                  </Link>
                  <AddToCartButton
                    size="sm"
                    className="mt-3 w-full"
                    product={{ id: p.id, slug: p.slug, name: p.name, image: p.thumbnail, price: p.price, stock: p.stock }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Spec rows */}
          <dl className="mt-8 overflow-hidden rounded-3xl border">
            <AnimatePresence initial={false}>
              {visible.map((row, ri) => {
                const best = bestOf(row);
                return (
                  <motion.div
                    key={row.label}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn("grid gap-4 px-4 py-4", ri % 2 === 1 && "bg-secondary")}
                    style={{ gridTemplateColumns: cols }}
                  >
                    <dt className={cn("sticky left-0 z-10 -my-4 -ml-4 py-4 pl-4 text-sm font-semibold", ri % 2 === 1 ? "bg-secondary" : "bg-background")}>
                      {row.label}
                    </dt>
                    {products.map((p) => {
                      const isBest = best !== null && Number(row.key(p)) === best;
                      return (
                        <dd key={p.id} className={cn("flex items-start gap-2", isBest && "font-semibold")}>
                          <div className="min-w-0 flex-1">{row.render(p)}</div>
                          {isBest && (
                            <motion.span
                              initial={{ scale: 0, rotate: -30 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                              className="grid h-7 w-7 flex-none place-items-center rounded-full bg-deal/20 text-deal"
                              title="Best in this comparison"
                            >
                              <Crown className="h-3.5 w-3.5" />
                            </motion.span>
                          )}
                        </dd>
                      );
                    })}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {visible.length === 0 && <p className="p-6 text-center text-muted-foreground">These products match on every detail.</p>}
          </dl>
        </div>
      </div>

      {products.length < COMPARE_LIMIT && (
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-dashed px-5 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" /> Add {products.length < 2 ? "another product" : "more products"} (up to {COMPARE_LIMIT})
        </Link>
      )}
    </div>
  );
}

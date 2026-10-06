"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { fetchProducts } from "@/lib/dummyjson";
import { productQuerySchema } from "@/lib/validations";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Category = { name: string; slug: string };
type Result = { items: Product[]; total: number; page: number; pages: number };

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export function ProductsExplorer({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const qs = params.toString();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery<Result>({
    queryKey: ["products", qs],
    queryFn: () => fetchProducts(productQuerySchema.parse(Object.fromEntries(new URLSearchParams(qs)))),
    placeholderData: keepPreviousData,
  });

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!("page" in patch)) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const q = params.get("q");
  const category = params.get("category");
  const sort = params.get("sort") ?? "newest";
  const page = Number(params.get("page") ?? 1);
  const activeCat = categories.find((c) => c.slug === category);

  const title = q ? `Results for “${q}”` : activeCat ? activeCat.name : "All products";

  const filters = (
    <Filters
      categories={categories}
      category={category}
      min={params.get("min") ?? ""}
      max={params.get("max") ?? ""}
      onCategory={(slug) => update({ category: slug })}
      onPrice={(min, max) => update({ min: min || null, max: max || null })}
    />
  );

  return (
    <div className="container py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.total} ${data.total === 1 ? "product" : "products"}` : "Loading products"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal /> Filters
          </Button>
          <label className="sr-only" htmlFor="sort">Sort by</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="h-11 rounded-full border border-input bg-background px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {(q || category || params.get("min") || params.get("max")) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {q && <Chip label={`“${q}”`} onRemove={() => update({ q: null })} />}
          {activeCat && <Chip label={activeCat.name} onRemove={() => update({ category: null })} />}
          {(params.get("min") || params.get("max")) && (
            <Chip label={`$${params.get("min") || 0} – $${params.get("max") || "any"}`} onRemove={() => update({ min: null, max: null })} />
          )}
          <button onClick={() => router.replace(pathname)} className="text-sm font-semibold text-primary hover:underline">Clear all</button>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>

        <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3"><Skeleton className="aspect-square" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/3" /></div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-3xl bg-secondary p-10 text-center">
              <p className="font-semibold">Products couldn&apos;t be loaded.</p>
              <Button className="mt-4" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : data && data.items.length === 0 ? (
            <div className="rounded-3xl bg-secondary p-10 text-center">
              <p className="font-display text-2xl font-bold">No products match these filters</p>
              <p className="mt-2 text-muted-foreground">Remove a filter or search for something broader.</p>
              <Button className="mt-5" onClick={() => router.replace(pathname)}>Clear filters</Button>
            </div>
          ) : data ? (
            <>
              <ProductGrid products={data.items} />
              {data.pages > 1 && (
                <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2">
                  {Array.from({ length: data.pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { update({ page: String(i + 1) }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      aria-current={page === i + 1 ? "page" : undefined}
                      className={cn("h-10 w-10 rounded-full text-sm font-semibold", page === i + 1 ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}
                    >
                      {i + 1}
                    </button>
                  ))}
                </nav>
              )}
            </>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-foreground/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)} />
            <motion.div
              role="dialog"
              aria-label="Filters"
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background p-6 lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-xl font-bold">Filters</p>
                <Button variant="ghost" size="icon" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X /></Button>
              </div>
              {filters}
              <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>Show results</Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent py-1 pl-3 pr-1 text-sm font-medium text-accent-foreground">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label}`} className="grid h-6 w-6 place-items-center rounded-full hover:bg-background/60"><X className="h-3.5 w-3.5" /></button>
    </span>
  );
}

function Filters({
  categories,
  category,
  min,
  max,
  onCategory,
  onPrice,
}: {
  categories: Category[];
  category: string | null;
  min: string;
  max: string;
  onCategory: (slug: string | null) => void;
  onPrice: (min: string, max: string) => void;
}) {
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);
  useEffect(() => { setLo(min); setHi(max); }, [min, max]);

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 font-semibold">Category</p>
        <ul className="space-y-1">
          <li>
            <button onClick={() => onCategory(null)} className={cn("w-full rounded-xl px-3 py-2 text-left text-sm", !category ? "bg-accent font-semibold text-accent-foreground" : "hover:bg-secondary")}>All</button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button onClick={() => onCategory(c.slug)} className={cn("w-full rounded-xl px-3 py-2 text-left text-sm", category === c.slug ? "bg-accent font-semibold text-accent-foreground" : "hover:bg-secondary")}>{c.name}</button>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onPrice(lo, hi); }}>
        <p className="mb-3 font-semibold">Price</p>
        <div className="flex items-center gap-2">
          <Input type="number" min={0} inputMode="numeric" placeholder="Min" aria-label="Minimum price" value={lo} onChange={(e) => setLo(e.target.value)} />
          <span className="text-muted-foreground">to</span>
          <Input type="number" min={0} inputMode="numeric" placeholder="Max" aria-label="Maximum price" value={hi} onChange={(e) => setHi(e.target.value)} />
        </div>
        <Button type="submit" variant="outline" size="sm" className="mt-3 w-full">Apply price</Button>
      </form>
    </div>
  );
}

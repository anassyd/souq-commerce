import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { byRating, getAllProducts } from "@/lib/dummyjson";
import { cn, newestRank } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Hero } from "@/components/home/hero";
import { CategoryBento } from "@/components/home/category-bento";
import { DealCountdown } from "@/components/home/deal-countdown";
import { Newsletter } from "@/components/home/newsletter";
import { ProductGrid } from "@/components/product/product-grid";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";

export const revalidate = 3600;

// The six categories shown in the home grid, in this order (DummyJSON category slugs).
const HOME_CATEGORIES = ["smartphones", "laptops", "furniture", "fragrances", "mens-shoes", "clothing"];

export default async function HomePage() {
  const products = await getAllProducts();

  const cats = HOME_CATEGORIES.map((slug) => {
    const inCat = products.filter((p) => p.category.slug === slug);
    // Cut-out images look best in the tiles, so prefer them for the cover.
    const cover = [...inCat].sort((a, b) => Number(!!a.photo) - Number(!!b.photo) || byRating(a, b))[0];
    return { id: slug, slug, name: inCat[0]?.category.name ?? slug, image: cover?.thumbnail ?? "", photo: !!cover?.photo, count: inCat.length };
  }).filter((c) => c.count > 0);

  const allCategories = Array.from(new Map(products.map((p) => [p.category.slug, p.category])).values());
  const counts = new Map<string, number>();
  for (const p of products) counts.set(p.category.slug, (counts.get(p.category.slug) ?? 0) + 1);

  const deals = products.filter((p) => p.compareAtPrice).sort((a, b) => b.discountPercent - a.discountPercent).slice(0, 4);
  const popular = products.filter((p) => p.reviewCount > 0).sort(byRating).slice(0, 8);
  const newest = [...products].sort((a, b) => newestRank(b.id) - newestRank(a.id)).slice(0, 8);
  const clothing = products.filter((p) => p.category.slug === "clothing").slice(0, 3);
  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).slice(0, 24) as string[];
  const spotlight = popular[0];

  return (
    <>
      <Hero productCount={products.length} categoryCount={allCategories.length} />

      <div className="border-b bg-background py-4">
        <Marquee seconds={60}>
          {allCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="mx-1.5 inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground"
            >
              {c.name}
              <span className="rounded-full bg-secondary px-1.5 text-xs text-muted-foreground">{counts.get(c.slug)}</span>
            </Link>
          ))}
        </Marquee>
      </div>

      <section className="container mt-16">
        <Reveal><SectionHead eyebrow="Browse" title="Shop by category" href="/products" link="All categories" /></Reveal>
        <CategoryBento categories={cats} />
      </section>

      {deals.length > 0 && (
        <section className="container mt-20">
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-deal/15 p-6 md:p-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-foreground/60">Ends tonight</p>
                <h2 className="mt-1 text-3xl font-bold md:text-4xl">Deals worth grabbing</h2>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <DealCountdown />
                <Link href="/products?sort=price-asc" className="group inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  See all deals <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <ProductGrid products={deals} />
          </Reveal>
        </section>
      )}

      <section className="container mt-20">
        <Reveal><SectionHead eyebrow="Loved by customers" title="Popular right now" href="/products?sort=rating" link="See top rated" /></Reveal>
        <ProductGrid products={popular} />
      </section>

      {clothing.length >= 3 && <ClothingPromo items={clothing} />}

      <section className="container mt-20">
        <Reveal><SectionHead eyebrow="Just landed" title="New arrivals" href="/products?sort=newest" link="See what's new" /></Reveal>
        <ProductGrid products={newest} />
      </section>

      {spotlight && <Spotlight product={spotlight} />}

      {brands.length > 0 && (
        <section className="mt-20 border-y bg-secondary/50 py-8">
          <p className="container mb-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Brands you know</p>
          <Marquee seconds={45}>
            {brands.map((b) => (
              <span key={b} className="mx-8 whitespace-nowrap font-display text-2xl font-bold text-foreground/30 transition-colors hover:text-foreground">
                {b}
              </span>
            ))}
          </Marquee>
        </section>
      )}

      <div className="container mt-20">
        <Reveal><Newsletter /></Reveal>
      </div>
    </>
  );
}

function SectionHead({ eyebrow, title, href, link }: { eyebrow: string; title: string; href: string; link: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-bold md:text-4xl">{title}</h2>
      </div>
      <Link href={href} className="group inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary">
        {link} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function ClothingPromo({ items }: { items: Product[] }) {
  return (
    <section className="container mt-20">
      <Reveal>
        <Link
          href="/products?category=clothing"
          className="group relative isolate grid overflow-hidden rounded-[2rem] bg-primary text-primary-foreground md:grid-cols-2"
        >
          <div className="bg-grid pointer-events-none absolute inset-0 -z-10 text-primary-foreground/[0.07]" />
          <div className="pointer-events-none absolute -left-16 -top-16 -z-10 h-64 w-64 animate-float rounded-full bg-deal/40 blur-3xl" />
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-deal">New collection</p>
            <h2 className="mt-2 text-4xl font-extrabold leading-none md:text-6xl">Everyday clothing, done right.</h2>
            <p className="mt-4 max-w-sm text-primary-foreground/75">Hoodies, tees, joggers and caps that go with everything you already own.</p>
            <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-background px-6 py-3 font-semibold text-foreground transition-transform group-hover:scale-105">
              Shop clothing <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          <div className="relative grid min-h-[320px] grid-cols-2 grid-rows-2 gap-3 p-3 md:min-h-[420px]">
            {items.map((p, i) => (
              <div
                key={p.id}
                className={cn(
                  "relative overflow-hidden rounded-3xl bg-primary-foreground/10 transition-transform duration-700 ease-out",
                  i === 0 && "row-span-2 group-hover:-rotate-1 group-hover:scale-[1.02]",
                  i === 1 && "group-hover:translate-x-1 group-hover:rotate-1",
                  i === 2 && "group-hover:-translate-x-1 group-hover:-rotate-1"
                )}
              >
                <Image src={p.thumbnail} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
            ))}
          </div>
        </Link>
      </Reveal>
    </section>
  );
}

function Spotlight({ product }: { product: Product }) {
  return (
    <section className="container mt-20">
      <Reveal>
        <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] border bg-gradient-to-br from-accent via-background to-deal/10 p-6 md:grid-cols-[1fr_1.1fr] md:p-12">
          <div className="relative aspect-square">
            <div className="absolute inset-8 animate-float rounded-full bg-primary/10 blur-2xl" />
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className={cn("transition-transform duration-700 hover:scale-105", product.photo ? "rounded-3xl object-cover" : "object-contain mix-blend-multiply")}
            />
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-deal px-3 py-1 text-xs font-bold uppercase tracking-wider text-deal-foreground">
              <Star className="h-3.5 w-3.5 fill-current" /> Customers&apos; #1 pick
            </p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">{product.name}</h2>
            <p className="mt-4 line-clamp-3 max-w-prose text-muted-foreground">{product.description}</p>
            <p className="mt-5 font-semibold">
              Rated {product.rating.toFixed(1)} / 5 from {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}
            </p>
            <Link
              href={`/products/${product.slug}`}
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:shadow-xl hover:shadow-primary/30"
            >
              See why people love it <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

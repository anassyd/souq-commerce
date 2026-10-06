import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { getProduct, getRelated, idFromSlug } from "@/lib/dummyjson";
import { ProductGallery } from "@/components/product/product-gallery";
import { Price } from "@/components/product/price";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { LiveRating, ProductReviews } from "@/components/product/product-reviews";
import { ProductGrid } from "@/components/product/product-grid";
import { CompareToggle } from "@/components/compare/compare-button";

type Props = { params: { slug: string } };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(idFromSlug(params.slug));
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description, openGraph: { images: [product.thumbnail] } };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(idFromSlug(params.slug));
  if (!product) notFound();
  const related = await getRelated(product.category.slug, product.id);

  const perks = [
    { icon: Truck, text: product.shipping ?? "Free delivery over $50" },
    { icon: RotateCcw, text: product.returnPolicy ?? "30-day returns" },
    { icon: ShieldCheck, text: product.warranty ?? "Secure checkout" },
  ];

  return (
    <div className="container py-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <ProductGallery images={product.images} name={product.name} photo={product.photo} />

        <div className="lg:pt-4">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {product.brand && <span className="text-primary">{product.brand}</span>}
            <Link href={`/products?category=${product.category.slug}`} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              {product.category.name}
            </Link>
          </div>
          <h1 className="mt-1 text-3xl font-bold leading-tight md:text-4xl">{product.name}</h1>
          <LiveRating product={product} className="mt-3" />
          <Price price={product.price} compareAt={product.compareAtPrice} size="lg" className="mt-6" />
          <p className="mt-6 max-w-prose leading-relaxed text-muted-foreground">{product.description}</p>

          <PurchasePanel
            product={{ id: product.id, slug: product.slug, name: product.name, image: product.thumbnail, price: product.price, stock: product.stock }}
          />

          <CompareToggle item={{ id: product.id, name: product.name, image: product.thumbnail, photo: product.photo }} className="mt-5" />

          <ul className="mt-8 grid gap-3 rounded-3xl bg-secondary p-5 text-sm sm:grid-cols-3">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-background text-primary shadow-sm"><Icon className="h-4 w-4" /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ProductReviews product={{ id: product.id, ratingTotal: product.ratingTotal, reviewCount: product.reviewCount }} apiReviews={product.reviews} />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-3xl font-bold">More in {product.category.name}</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

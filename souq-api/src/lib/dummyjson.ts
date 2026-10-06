// Products, categories and reviews come from https://dummyjson.com (public, CORS-enabled, read-only),
// merged with the extra catalog in platzi-products.ts.
import type { Category, Product, ProductDetail } from "@/lib/types";
import type { ProductQuery } from "@/lib/validations";
import { categoryName, newestRank, slugify } from "@/lib/utils";
import { getPlatziProduct, getPlatziProducts } from "@/lib/platzi-products";

export { categoryName };

export const DUMMYJSON = "https://dummyjson.com";
export const PAGE_SIZE = 12;

const LIST_FIELDS = "id,title,description,category,price,discountPercentage,rating,stock,brand,thumbnail,images,reviews";

type DJReview = { rating: number; comment: string; date: string; reviewerName: string };
type DJProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
  reviews?: DJReview[];
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
};
type DJList = { products: DJProduct[]; total: number; skip: number; limit: number };

export function toProduct(p: DJProduct): Product {
  const price = Math.round(p.price * 100);
  const discount = Math.round(p.discountPercentage ?? 0);
  // Only call it a deal when the discount is meaningful.
  const compareAtPrice = discount >= 10 ? Math.round(price / (1 - p.discountPercentage / 100)) : null;
  const images = p.images?.length ? p.images : [p.thumbnail];
  // DummyJSON's own `rating` field doesn't match its reviews, so the rating is the reviews' average.
  const reviews = p.reviews ?? [];
  const ratingTotal = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    id: String(p.id),
    name: p.title,
    slug: `${p.id}-${slugify(p.title)}`,
    description: p.description,
    brand: p.brand ?? null,
    price,
    compareAtPrice,
    discountPercent: discount,
    images,
    thumbnail: p.thumbnail,
    stock: p.stock,
    rating: reviews.length ? Math.round((ratingTotal / reviews.length) * 10) / 10 : 0,
    ratingTotal,
    reviewCount: reviews.length,
    category: { slug: p.category, name: categoryName(p.category) },
  };
}

function toDetail(p: DJProduct): ProductDetail {
  return {
    ...toProduct(p),
    warranty: p.warrantyInformation ?? null,
    shipping: p.shippingInformation ?? null,
    returnPolicy: p.returnPolicy ?? null,
    reviews: (p.reviews ?? []).map((r, i) => ({
      id: `dj-${p.id}-${i}`,
      author: r.reviewerName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.date,
    })),
  };
}

async function get<T>(path: string, init?: RequestInit & { next?: { revalidate?: number } }): Promise<T> {
  const res = await fetch(`${DUMMYJSON}${path}`, init);
  if (!res.ok) throw new Error(`DummyJSON ${res.status} on ${path}`);
  return res.json() as Promise<T>;
}

/** "12-iphone-x" → "12", "p31-sleek-sofa" → "p31" */
export const idFromSlug = (slug: string) => slug.split("-")[0];

/** Highest rated first; among equals, the one with more reviews wins. */
export const byRating = (a: Product, b: Product) => b.rating - a.rating || b.reviewCount - a.reviewCount;

/* ---------- used by server components ---------- */

export async function getAllProducts(): Promise<Product[]> {
  const [data, extra] = await Promise.all([
    get<DJList>(`/products?limit=0&select=${LIST_FIELDS}`, { next: { revalidate: 3600 } }),
    getPlatziProducts(),
  ]);
  return [...data.products.map(toProduct), ...extra];
}

export async function getCategories(): Promise<Category[]> {
  const [data, extra] = await Promise.all([
    get<{ slug: string; name: string }[]>(`/products/categories`, { next: { revalidate: 86400 } }),
    getPlatziProducts(),
  ]);
  const list = data.map((c) => ({ slug: c.slug, name: c.name }));
  for (const p of extra) if (!list.some((c) => c.slug === p.category.slug)) list.push(p.category);
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProduct(id: string): Promise<ProductDetail | null> {
  if (/^p\d+$/.test(id)) return getPlatziProduct(id);
  if (!/^\d+$/.test(id)) return null;
  const res = await fetch(`${DUMMYJSON}/products/${id}`, { next: { revalidate: 3600 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`DummyJSON ${res.status} on /products/${id}`);
  return toDetail(await res.json());
}

export async function getRelated(category: string, excludeId: string): Promise<Product[]> {
  const [data, extra] = await Promise.all([
    get<DJList>(`/products/category/${encodeURIComponent(category)}?limit=0&select=${LIST_FIELDS}`, { next: { revalidate: 3600 } }),
    getPlatziProducts(),
  ]);
  return [...data.products.map(toProduct), ...extra.filter((p) => p.category.slug === category)]
    .filter((p) => p.id !== excludeId)
    .sort(byRating)
    .slice(0, 4);
}

/* ---------- used in the browser through TanStack Query ---------- */

/**
 * DummyJSON can't combine search + category + price filters in one call, so we ask it for the
 * narrowest list (category or search, both API-side), add matching Platzi items, then filter,
 * sort and paginate here.
 */
export async function fetchProducts(q: ProductQuery) {
  const path = q.category
    ? `/products/category/${encodeURIComponent(q.category)}?limit=0&select=${LIST_FIELDS}`
    : q.q
      ? `/products/search?q=${encodeURIComponent(q.q)}&limit=0&select=${LIST_FIELDS}`
      : `/products?limit=0&select=${LIST_FIELDS}`;

  const [data, extra] = await Promise.all([get<DJList>(path), getPlatziProducts()]);
  const term = q.q?.toLowerCase();
  const matches = (p: Product) =>
    !term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) || p.category.name.toLowerCase().includes(term);

  let list = [
    ...data.products.map(toProduct).filter((p) => !q.category || matches(p)),
    ...extra.filter((p) => (!q.category || p.category.slug === q.category) && matches(p)),
  ];

  if (q.min !== undefined) list = list.filter((p) => p.price >= q.min! * 100);
  if (q.max !== undefined) list = list.filter((p) => p.price <= q.max! * 100);

  list.sort((a, b) =>
    q.sort === "price-asc" ? a.price - b.price
    : q.sort === "price-desc" ? b.price - a.price
    : q.sort === "rating" ? byRating(a, b)
    : newestRank(b.id) - newestRank(a.id)
  );

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return { items: list.slice((q.page - 1) * PAGE_SIZE, q.page * PAGE_SIZE), total, page: q.page, pages };
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  const dj = ids.filter((id) => /^\d+$/.test(id));
  const needsPlatzi = ids.some((id) => /^p\d+$/.test(id));
  const [results, extra] = await Promise.all([
    Promise.allSettled(dj.map((id) => get<DJProduct>(`/products/${id}?select=${LIST_FIELDS}`))),
    needsPlatzi ? getPlatziProducts() : Promise.resolve([]),
  ]);
  const found = [
    ...results.flatMap((r) => (r.status === "fulfilled" ? [toProduct(r.value)] : [])),
    ...extra.filter((p) => ids.includes(p.id)),
  ];
  // Keep the order the ids were saved in.
  return ids.flatMap((id) => found.find((p) => p.id === id) ?? []);
}

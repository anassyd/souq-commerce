// Extra catalog from the Platzi Fake Store API (https://fakeapi.platzi.com). Its database is publicly
// editable, so test entries (uuid titles, placeholder images) are filtered out, and items are mapped onto
// the DummyJSON categories they belong to. Platzi has no reviews, so ratings come only from customers here.
import type { Product, ProductDetail } from "@/lib/types";
import { categoryName, slugify } from "@/lib/utils";

// Server components call the API directly; the browser goes through the /api/platzi rewrite (CORS).
const BASE = typeof window === "undefined" ? "https://api.escuelajs.co/api/v1" : "/api/platzi";

type PlatziProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: { slug: string; name: string };
};

/** First matching rule wins; `fallback` is used when no keyword matches. */
const CATEGORY_RULES: Record<string, { rules: [RegExp, string][]; fallback: string }> = {
  clothes: { rules: [], fallback: "clothing" },
  furniture: { rules: [], fallback: "furniture" },
  shoes: { rules: [[/heel|pump|espadrille|sandal|boot/i, "womens-shoes"]], fallback: "mens-shoes" },
  electronics: {
    rules: [
      [/laptop/i, "laptops"],
      [/watch/i, "mens-watches"],
      [/toaster|kettle|blender/i, "kitchen-accessories"],
    ],
    fallback: "mobile-accessories",
  },
  miscellaneous: {
    rules: [
      [/parfum|perfume|fragrance/i, "fragrances"],
      [/sunglass/i, "sunglasses"],
      [/handbag|luggage|carry-on|bag/i, "womens-bags"],
      [/bicycle|bike/i, "sports-accessories"],
      [/kart|scooter/i, "vehicle"],
      [/tumbler|glass|mug|cup/i, "kitchen-accessories"],
    ],
    fallback: "home-decoration",
  },
};

const cleanUrl = (u: string) => u.replace(/[[\]"]/g, "").trim();
const isJunk = (p: PlatziProduct) =>
  /^title-|test|^.{0,2}$/i.test(p.title) || /from-config/i.test(p.category.slug) || !(p.category.slug in CATEGORY_RULES);

function toProduct(p: PlatziProduct): Product | null {
  if (isJunk(p)) return null;
  const images = p.images.map(cleanUrl).filter((u) => u.startsWith("https://i.imgur.com/"));
  if (!images.length) return null;
  const { rules, fallback } = CATEGORY_RULES[p.category.slug];
  const category = rules.find(([re]) => re.test(p.title))?.[1] ?? fallback;
  return {
    id: `p${p.id}`,
    name: p.title,
    slug: `p${p.id}-${slugify(p.title)}`,
    description: p.description,
    brand: null,
    price: Math.round(p.price * 100),
    compareAtPrice: null,
    discountPercent: 0,
    images,
    thumbnail: images[0],
    // Platzi has no inventory; derive a stable stock level from the id.
    stock: 4 + ((p.id * 37) % 60),
    rating: 0,
    ratingTotal: 0,
    reviewCount: 0,
    category: { slug: category, name: categoryName(category) },
    photo: true,
  };
}

let browserCache: Promise<Product[]> | null = null;

/** All usable Platzi products. Never throws: if the API is down the store just shows DummyJSON items. */
export function getPlatziProducts(): Promise<Product[]> {
  const load = async () => {
    try {
      const res = await fetch(`${BASE}/products?offset=0&limit=200`, { next: { revalidate: 3600 } } as RequestInit);
      if (!res.ok) return [];
      const list = (await res.json()) as PlatziProduct[];
      return list.flatMap((p) => toProduct(p) ?? []);
    } catch {
      return [];
    }
  };
  if (typeof window === "undefined") return load();
  browserCache ??= load().then((r) => {
    if (!r.length) browserCache = null; // retry next time instead of caching a failure
    return r;
  });
  return browserCache;
}

export async function getPlatziProduct(id: string): Promise<ProductDetail | null> {
  const n = id.slice(1);
  if (!/^\d+$/.test(n)) return null;
  try {
    const res = await fetch(`${BASE}/products/${n}`, { next: { revalidate: 3600 } } as RequestInit);
    if (!res.ok) return null;
    const p = toProduct((await res.json()) as PlatziProduct);
    return p && { ...p, warranty: null, shipping: null, returnPolicy: null, reviews: [] };
  } catch {
    return null;
  }
}

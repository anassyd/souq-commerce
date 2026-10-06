import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Review } from "@/lib/types";
import { useMounted } from "@/lib/use-mounted";

type ReviewsState = {
  reviews: (Review & { userId: string; productId: string })[];
  upsert: (r: { productId: string; userId: string; author: string; rating: number; comment: string }) => void;
};

/** Reviews written by customers in this browser. The rest come from the product API. */
export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      reviews: [],
      upsert: (r) =>
        set((s) => {
          const rest = s.reviews.filter((x) => !(x.productId === r.productId && x.userId === r.userId));
          return { reviews: [{ ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...rest] };
        }),
    }),
    { name: "souq-reviews" }
  )
);

/**
 * A product's rating across every customer review: the API's reviews (as `ratingTotal`/`reviewCount`)
 * plus the ones written here. Before hydration it returns the API numbers so server and client match.
 */
export function useProductRating(product: RatingSource) {
  const mounted = useMounted();
  const all = useReviews((s) => s.reviews);
  return combineRating(product, mounted ? all : []);
}

type RatingSource = { id: string; ratingTotal: number; reviewCount: number };

/** Same as useProductRating, for when several products are rated at once (hooks can't run in a loop). */
export function combineRating(product: RatingSource, localReviews: { productId: string; rating: number }[]) {
  const local = localReviews.filter((r) => r.productId === product.id);
  const count = product.reviewCount + local.length;
  const total = product.ratingTotal + local.reduce((sum, r) => sum + r.rating, 0);
  return { value: count ? total / count : 0, count };
}

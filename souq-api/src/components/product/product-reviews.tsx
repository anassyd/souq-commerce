"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { toast } from "sonner";
import type { Review } from "@/lib/types";
import { reviewSchema, type ReviewInput } from "@/lib/validations";
import { useAuth } from "@/store/auth";
import { useProductRating, useReviews } from "@/store/reviews";
import { useMounted } from "@/lib/use-mounted";
import { Rating, Stars } from "@/components/product/rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type RatingSource = { id: string; ratingTotal: number; reviewCount: number };

/** Rating line under the product title; includes reviews customers wrote on this site. */
export function LiveRating({ product, className }: { product: RatingSource; className?: string }) {
  const { value, count } = useProductRating(product);
  return (
    <a href="#reviews" className={cn("inline-block rounded-lg transition-opacity hover:opacity-80", className)}>
      <Rating value={value} count={count} />
    </a>
  );
}

export function ProductReviews({ product, apiReviews }: { product: RatingSource; apiReviews: Review[] }) {
  const mounted = useMounted();
  const mine = useReviews((s) => s.reviews);
  const local = mounted ? mine.filter((r) => r.productId === product.id) : [];
  const list = [...local, ...apiReviews];
  const { value, count } = useProductRating(product);
  const [filter, setFilter] = useState<number | null>(null);
  const shown = filter ? list.filter((r) => r.rating === filter) : list;

  const bars = [5, 4, 3, 2, 1].map((stars) => {
    const n = list.filter((r) => r.rating === stars).length;
    return { stars, n, pct: list.length ? (n / list.length) * 100 : 0 };
  });

  return (
    <section className="mt-24 grid gap-10 lg:grid-cols-[1fr_1.4fr]" aria-labelledby="reviews">
      <div className="lg:sticky lg:top-40 lg:self-start">
        <h2 id="reviews" className="scroll-mt-40 text-3xl font-bold">Customer reviews</h2>
        <div className="mt-5 rounded-3xl bg-secondary p-6">
          {count === 0 ? (
            <p className="text-muted-foreground">No reviews yet. Be the first to share what you think.</p>
          ) : (
            <>
              <div className="flex items-end gap-4">
                <p className="font-display text-6xl font-extrabold leading-none">{value.toFixed(1)}</p>
                <div className="pb-1">
                  <Stars value={value} className="text-xl" />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Based on {count} {count === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-2">
                {bars.map((b, i) => (
                  <li key={b.stars}>
                    <button
                      type="button"
                      onClick={() => setFilter(filter === b.stars ? null : b.stars)}
                      disabled={b.n === 0}
                      aria-pressed={filter === b.stars}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-sm transition-colors disabled:cursor-default disabled:opacity-50",
                        filter === b.stars ? "font-semibold text-primary" : "enabled:hover:text-primary"
                      )}
                    >
                      <span className="w-12 flex-none text-left">{b.stars} star</span>
                      <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-background">
                        <motion.span
                          className="absolute inset-y-0 left-0 rounded-full bg-deal"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${b.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </span>
                      <span className="w-8 flex-none text-right tabular-nums text-muted-foreground">{b.n}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <ReviewForm productId={product.id} />
      </div>

      <div>
        {filter && (
          <p className="mb-4 text-sm">
            Showing {filter}-star reviews ·{" "}
            <button onClick={() => setFilter(null)} className="font-semibold text-primary hover:underline">Show all</button>
          </p>
        )}
        <ul className="space-y-4">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="rounded-3xl border p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-accent font-display font-bold text-accent-foreground">
                    {r.author[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.author}</p>
                    <time className="text-xs text-muted-foreground" dateTime={r.createdAt}>
                      {new Date(r.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </time>
                  </div>
                  <Stars value={r.rating} className="text-base" />
                </div>
                <p className="mt-3 leading-relaxed">{r.comment}</p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </section>
  );
}

function ReviewForm({ productId }: { productId: string }) {
  const mounted = useMounted();
  const user = useAuth((s) => s.user);
  const upsert = useReviews((s) => s.upsert);
  const [hover, setHover] = useState(0);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 0, comment: "" } });
  const value = watch("rating");

  if (!mounted) return null;
  if (!user) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link> to write a review.
      </p>
    );
  }

  const onSubmit = (v: ReviewInput) => {
    upsert({ productId, userId: user.id, author: user.name, rating: v.rating, comment: v.comment });
    toast.success("Review posted");
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 rounded-3xl border p-5">
      <p className="font-semibold">Write a review</p>
      <div className="flex gap-1" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onMouseEnter={() => setHover(n)}
            onClick={() => setValue("rating", n, { shouldValidate: true })}
          >
            <Star className={cn("h-7 w-7 transition-colors", n <= (hover || value) ? "fill-deal text-deal" : "text-muted-foreground")} />
          </motion.button>
        ))}
      </div>
      {errors.rating && <p className="text-sm text-destructive">Choose a rating from 1 to 5</p>}
      <Textarea placeholder="What did you like or dislike?" aria-invalid={!!errors.comment} {...register("comment")} />
      {errors.comment && <p className="text-sm text-destructive">{errors.comment.message}</p>}
      <Button type="submit" disabled={isSubmitting}>Post review</Button>
    </form>
  );
}

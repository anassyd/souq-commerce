"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = ["iphone", "a gaming laptop", "a perfume", "sunglasses", "a leather sofa"];

export function Hero({ productCount, categoryCount }: { productCount: number; categoryCount: number }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % SUGGESTIONS.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10 text-primary-foreground/[0.07]" />
      <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-80 w-80 animate-float rounded-full bg-sky-400/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 -z-10 h-96 w-96 animate-float rounded-full bg-deal/30 blur-3xl [animation-delay:-5s]" />
      <div className="pointer-events-none absolute right-1/3 top-0 -z-10 h-64 w-64 animate-float rounded-full bg-fuchsia-400/25 blur-3xl [animation-delay:-9s]" />
      <div className="container relative grid gap-10 py-16 md:py-24 lg:grid-cols-[1.25fr_1fr] lg:items-end">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-deal opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-deal" />
            </span>
            {productCount} products across {categoryCount} categories
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl font-extrabold leading-[0.95] sm:text-6xl lg:text-7xl"
          >
            What are you <span className="text-shine animate-shine text-deal">shopping</span> for today?
          </motion.h1>

          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={(e) => {
              e.preventDefault();
              router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");
            }}
            className="relative mt-10 max-w-2xl"
            role="search"
          >
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search products"
              className="h-16 w-full rounded-full bg-background pl-14 pr-36 text-base text-foreground shadow-2xl shadow-black/20 transition-shadow focus:outline-none focus:ring-4 focus:ring-deal"
            />
            {!q && (
              <div className="pointer-events-none absolute left-14 top-1/2 flex -translate-y-1/2 gap-1.5 text-base text-muted-foreground">
                <span>Try</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={i}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="hidden text-foreground sm:inline"
                  >
                    {SUGGESTIONS[i]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            <Button type="submit" variant="deal" size="lg" className="absolute right-2 top-1/2 -translate-y-1/2">Search</Button>
          </motion.form>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Free delivery", "on orders over $50"],
            ["30-day returns", "on most items"],
            ["Secure checkout", "card or cash on delivery"],
            ["Real reviews", "from verified buyers"],
          ].map(([t, d], n) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.35 + n * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/10 p-4 backdrop-blur transition-colors hover:bg-primary-foreground/15"
            >
              <p className="font-semibold">{t}</p>
              <p className="text-primary-foreground/75">{d}</p>
            </motion.div>
          ))}
          <motion.div
            className="col-span-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
          >
            <Link href="/products?sort=price-asc" className="group flex items-center justify-between rounded-2xl bg-deal p-4 font-semibold text-deal-foreground hover:bg-deal/90">
              See today&apos;s deals
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

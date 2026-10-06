"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/lib/use-mounted";
import type { Product } from "@/lib/types";
import { fetchProductsByIds } from "@/lib/dummyjson";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
  const mounted = useMounted();
  const ids = useWishlist((s) => s.ids);
  const { data, isLoading } = useQuery<Product[]>({
    queryKey: ["wishlist", ids],
    enabled: mounted && ids.length > 0,
    queryFn: () => fetchProductsByIds(ids),
  });

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold">Wishlist</h1>
      {!mounted || (ids.length > 0 && isLoading) ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}</div>
      ) : ids.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-secondary p-10 text-center">
          <p className="font-semibold">Nothing saved yet.</p>
          <p className="mt-1 text-muted-foreground">Tap the heart on any product to keep it here.</p>
          <Button asChild className="mt-5"><Link href="/products">Browse products</Link></Button>
        </div>
      ) : (
        <div className="mt-8"><ProductGrid products={data ?? []} /></div>
      )}
    </div>
  );
}

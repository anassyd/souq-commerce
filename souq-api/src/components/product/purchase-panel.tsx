"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/store/cart";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { WishlistButton } from "@/components/product/wishlist-button";

export function PurchasePanel({ product }: { product: Omit<CartItem, "quantity"> }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const router = useRouter();
  const inStock = product.stock > 0;

  return (
    <div className="mt-8 space-y-4">
      <p className={inStock ? "font-semibold text-emerald-700" : "font-semibold text-destructive"}>
        {inStock ? (product.stock <= 5 ? `Only ${product.stock} left in stock` : "In stock") : "Out of stock"}
      </p>
      {inStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">Quantity</span>
          <QuantityStepper value={qty} max={product.stock} onChange={(v) => setQty(Math.max(1, v))} />
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <AddToCartButton product={product} quantity={qty} size="lg" openDrawer className="flex-1" />
        <Button
          size="lg"
          variant="deal"
          disabled={!inStock}
          className="flex-1"
          onClick={() => {
            add(product, qty);
            router.push("/cart");
          }}
        >
          Buy now
        </Button>
        <WishlistButton productId={product.id} className="h-12 w-12 border bg-background" />
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useCart, cartTotal, cartCount } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { FREE_SHIPPING, SHIPPING_FEE } from "@/lib/shipping";
import { useMounted } from "@/lib/use-mounted";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuantityStepper } from "@/components/cart/quantity-stepper";

export default function CartPage() {
  const mounted = useMounted();
  const { items, setQuantity, remove } = useCart();
  const user = useAuth((s) => s.user);

  if (!mounted) return <div className="container py-10"><Skeleton className="h-96" /></div>;

  const subtotal = cartTotal(items);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);

  if (items.length === 0) {
    return (
      <div className="container grid place-items-center py-24 text-center">
        <h1 className="text-4xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Find something you like and add it here.</p>
        <Button asChild size="lg" className="mt-8"><Link href="/products">Browse products</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold">Cart <span className="text-muted-foreground">({cartCount(items)})</span></h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y border-y">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li key={item.id} layout exit={{ opacity: 0, height: 0 }} className="flex gap-5 py-6">
                <Link href={`/products/${item.slug}`} className="relative h-28 w-28 flex-none overflow-hidden rounded-2xl bg-secondary sm:h-32 sm:w-32">
                  <Image src={item.image} alt={item.name} fill sizes="128px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <Link href={`/products/${item.slug}`} className="font-semibold hover:underline">{item.name}</Link>
                    <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatPrice(item.price)} each</p>
                  <div className="mt-auto flex items-center gap-4 pt-3">
                    <QuantityStepper value={item.quantity} max={item.stock} onChange={(q) => setQuantity(item.id, q)} />
                    <button onClick={() => remove(item.id)} className="text-sm text-muted-foreground hover:underline">Remove</button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside className="h-fit space-y-5 rounded-3xl bg-secondary p-6 lg:sticky lg:top-32">
          <div>
            <p className="text-sm font-medium">
              {remaining > 0 ? <>Add {formatPrice(remaining)} more for free delivery</> : <>Your order ships free</>}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
              <motion.div className="h-full rounded-full bg-deal" animate={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} />
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span className="font-semibold">{remaining > 0 ? formatPrice(SHIPPING_FEE) : "Free"}</span></div>
          </div>
          <div className="flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span><span>{formatPrice(subtotal + (remaining > 0 ? SHIPPING_FEE : 0))}</span>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href={user ? "/checkout" : "/login?callbackUrl=/checkout"}>
              <Lock /> {user ? "Continue to checkout" : "Sign in to check out"}
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

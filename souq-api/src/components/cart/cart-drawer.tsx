"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { useCart, cartTotal } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b px-6 py-5">
              <h2 className="text-xl font-bold">Your cart</h2>
              <Button variant="ghost" size="icon" onClick={close} aria-label="Close cart"><X /></Button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                <p className="font-semibold">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">Add something you like and it will show up here.</p>
                <Button asChild onClick={close}><Link href="/products">Browse products</Link></Button>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60, height: 0, marginTop: 0 }}
                        className="flex gap-4"
                      >
                        <Link href={`/products/${item.slug}`} onClick={close} className="relative h-24 w-24 flex-none overflow-hidden rounded-xl bg-secondary">
                          <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Link href={`/products/${item.slug}`} onClick={close} className="line-clamp-2 text-sm font-semibold hover:underline">{item.name}</Link>
                          <p className="mt-1 text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                          <div className="mt-auto flex items-center justify-between">
                            <QuantityStepper value={item.quantity} max={item.stock} onChange={(q) => setQuantity(item.id, q)} />
                            <button onClick={() => remove(item.id)} className="text-sm text-muted-foreground underline-offset-2 hover:underline">Remove</button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="space-y-4 border-t px-6 py-5">
                  <div className="flex justify-between text-base">
                    <span>Subtotal</span>
                    <motion.span key={cartTotal(items)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-bold">
                      {formatPrice(cartTotal(items))}
                    </motion.span>
                  </div>
                  <p className="text-sm text-muted-foreground">Shipping and taxes are calculated at checkout.</p>
                  <Button asChild size="lg" className="w-full" onClick={close}>
                    <Link href="/cart">Go to checkout</Link>
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

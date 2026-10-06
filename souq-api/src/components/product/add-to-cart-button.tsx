"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart, type CartItem } from "@/store/cart";

export function AddToCartButton({
  product,
  quantity = 1,
  openDrawer = false,
  ...props
}: { product: Omit<CartItem, "quantity">; quantity?: number; openDrawer?: boolean } & ButtonProps) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  return (
    <Button
      {...props}
      disabled={soldOut || props.disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
        if (openDrawer) open();
        else toast.success("Added to cart", { description: product.name, action: { label: "View cart", onClick: open } });
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={added ? "done" : "idle"}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="inline-flex items-center gap-2"
        >
          {soldOut ? "Sold out" : added ? (<><Check /> Added</>) : (<><ShoppingBag /> Add to cart</>)}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}

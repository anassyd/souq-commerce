"use client";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const mounted = useMounted();
  const active = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  const on = mounted && active;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-pressed={on}
      aria-label={on ? "Remove from wishlist" : "Save to wishlist"}
      className={cn("grid h-10 w-10 place-items-center rounded-full bg-background/90 shadow-sm backdrop-blur", className)}
    >
      <motion.span key={String(on)} initial={{ scale: on ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 12 }}>
        <Heart className={cn("h-5 w-5", on ? "fill-red-500 text-red-500" : "text-foreground")} />
      </motion.span>
    </motion.button>
  );
}

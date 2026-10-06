"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, GitCompareArrows } from "lucide-react";
import { toast } from "sonner";
import { COMPARE_LIMIT, useCompare, type CompareItem } from "@/store/compare";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

function useCompareToggle(item: CompareItem) {
  const mounted = useMounted();
  const active = useCompare((s) => s.items.some((x) => x.id === item.id));
  const toggle = useCompare((s) => s.toggle);
  const on = mounted && active;
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!toggle(item)) {
      toast.error(`You can compare up to ${COMPARE_LIMIT} products`, {
        description: "Remove one from the compare bar first.",
      });
    }
  };
  return { on, onClick };
}

/** Round icon button that sits on a product card, under the wishlist heart. */
export function CompareIconButton({ item, className }: { item: CompareItem; className?: string }) {
  const { on, onClick } = useCompareToggle(item);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? "Remove from compare" : "Add to compare"}
      title={on ? "Remove from compare" : "Compare"}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full shadow-sm backdrop-blur transition-colors",
        on ? "bg-primary text-primary-foreground" : "bg-background/90 text-foreground hover:bg-background",
        className,
        // Stay visible while selected, even if the caller hides it until hover.
        on && "!translate-x-0 !opacity-100"
      )}
    >
      {on ? <Check className="h-5 w-5" /> : <GitCompareArrows className="h-5 w-5" />}
    </motion.button>
  );
}

/** Checkbox-style control used on the product page. */
export function CompareToggle({ item, className }: { item: CompareItem; className?: string }) {
  const { on, onClick } = useCompareToggle(item);
  const count = useCompare((s) => s.items.length);
  const mounted = useMounted();
  return (
    <div className={cn("flex items-center gap-3 text-sm", className)}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={on}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold transition-colors",
          on ? "border-primary bg-accent text-accent-foreground" : "hover:border-primary hover:text-primary"
        )}
      >
        {on ? <Check className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}
        {on ? "Added to compare" : "Compare"}
      </button>
      {mounted && on && count > 1 && (
        <Link href="/compare" className="font-semibold text-primary hover:underline">
          Compare {count} now
        </Link>
      )}
    </div>
  );
}

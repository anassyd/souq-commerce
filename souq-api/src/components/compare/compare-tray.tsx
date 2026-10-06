"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GitCompareArrows, Plus, X } from "lucide-react";
import { COMPARE_LIMIT, useCompare } from "@/store/compare";
import { useMounted } from "@/lib/use-mounted";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Floating bar that collects products picked for comparison. Hidden on the compare page itself. */
export function CompareTray() {
  const mounted = useMounted();
  const pathname = usePathname();
  const items = useCompare((s) => s.items);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);
  const show = mounted && items.length > 0 && pathname !== "/compare";
  const empty = Math.max(0, COMPARE_LIMIT - items.length);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="region"
          aria-label="Products to compare"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-3xl rounded-3xl border bg-background/90 p-3 shadow-2xl shadow-foreground/15 backdrop-blur-xl sm:bottom-5"
        >
          <div className="flex items-center gap-3">
            <ul className="flex flex-1 gap-2 overflow-x-auto no-scrollbar">
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((it) => (
                  <motion.li
                    key={it.id}
                    layout
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="group relative h-14 w-14 flex-none"
                  >
                    <Link href={`/compare`} className="relative block h-full w-full overflow-hidden rounded-2xl bg-secondary" title={it.name}>
                      <Image src={it.image} alt={it.name} fill sizes="56px" className={cn(it.photo ? "object-cover" : "object-contain p-1.5 mix-blend-multiply")} />
                    </Link>
                    <button
                      onClick={() => remove(it.id)}
                      aria-label={`Remove ${it.name} from compare`}
                      className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-foreground text-background shadow transition-transform hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
              {Array.from({ length: empty }).map((_, i) => (
                <li key={`empty-${i}`} className="hidden h-14 w-14 flex-none place-items-center rounded-2xl border-2 border-dashed text-muted-foreground sm:grid">
                  <Plus className="h-4 w-4" />
                </li>
              ))}
            </ul>
            <div className="flex flex-none items-center gap-1">
              <Button variant="ghost" size="sm" onClick={clear} className="hidden sm:inline-flex">Clear</Button>
              {items.length < 2 ? (
                <p className="max-w-[9rem] text-xs text-muted-foreground sm:text-sm">Add one more to compare</p>
              ) : (
                <Button asChild size="sm">
                  <Link href="/compare"><GitCompareArrows /> Compare {items.length}</Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

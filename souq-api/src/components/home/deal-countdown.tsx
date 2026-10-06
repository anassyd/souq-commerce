"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Time left until local midnight, when "today's deals" roll over. */
function remaining() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
}

export function DealCountdown() {
  const [parts, setParts] = useState<number[] | null>(null);
  useEffect(() => {
    setParts(remaining());
    const t = setInterval(() => setParts(remaining()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-1.5" aria-label="Time left on today's deals" role="timer">
      {["h", "m", "s"].map((unit, i) => (
        <span key={unit} className="flex items-center gap-1.5">
          <span className="relative grid h-11 w-12 place-items-center overflow-hidden rounded-xl bg-foreground font-display text-lg font-bold tabular-nums text-background">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={parts ? parts[i] : "x"}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {parts ? String(parts[i]).padStart(2, "0") : "--"}
              </motion.span>
            </AnimatePresence>
          </span>
          {i < 2 && <span className="font-bold text-foreground/50">:</span>}
        </span>
      ))}
    </div>
  );
}

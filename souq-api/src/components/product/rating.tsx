import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Stars filled to the exact value (e.g. 4.3 fills 4 and a third). */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("relative inline-flex", className)} aria-hidden="true">
      <div className="flex">
        {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-[1em] w-[1em] fill-muted text-muted" />)}
      </div>
      <div className="absolute inset-y-0 left-0 flex overflow-hidden" style={{ width: `${(Math.max(0, Math.min(5, value)) / 5) * 100}%` }}>
        {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-[1em] w-[1em] flex-none fill-deal text-deal" />)}
      </div>
    </div>
  );
}

export function Rating({ value, count, compact, className }: { value: number; count?: number; compact?: boolean; className?: string }) {
  if (count === 0) {
    return (
      <div className={cn("flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
        <Stars value={0} className="text-base" />
        <span>{compact ? "No reviews" : "No reviews yet"}</span>
      </div>
    );
  }
  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)}>
      <span className="sr-only">Rated {value.toFixed(1)} out of 5</span>
      <Stars value={value} className="text-base" />
      <span className="font-semibold" aria-hidden="true">{value.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-muted-foreground">({count.toLocaleString()}{compact ? "" : count === 1 ? " review" : " reviews"})</span>
      )}
    </div>
  );
}

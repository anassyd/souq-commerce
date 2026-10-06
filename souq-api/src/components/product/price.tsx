import { cn, discountPercent, formatPrice } from "@/lib/utils";

export function Price({
  price,
  compareAt,
  size = "md",
  className,
}: {
  price: number;
  compareAt?: number | null;
  size?: "md" | "lg";
  className?: string;
}) {
  const off = discountPercent(price, compareAt);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-display font-bold", size === "lg" ? "text-4xl" : "text-lg")}>{formatPrice(price)}</span>
      {off > 0 && (
        <>
          <span className="text-sm text-muted-foreground line-through">{formatPrice(compareAt!)}</span>
          <span className="rounded-full bg-deal px-2 py-0.5 text-xs font-bold text-deal-foreground">-{off}%</span>
        </>
      )}
    </div>
  );
}

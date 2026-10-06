"use client";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  max,
  onChange,
  className,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center rounded-full border", className)}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Decrease quantity" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary disabled:opacity-40">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

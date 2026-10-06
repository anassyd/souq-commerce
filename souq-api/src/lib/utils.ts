import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY = (process.env.NEXT_PUBLIC_CURRENCY || "usd").toLowerCase();

/** Formats an amount stored in cents. */
export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY.toUpperCase() }).format(cents / 100);
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export const categoryName = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/** Newest first: Platzi items (ids like "p12") are the most recent additions to the catalog. */
export function newestRank(id: string) {
  return id.startsWith("p") ? 100_000 + Number(id.slice(1)) : Number(id);
}

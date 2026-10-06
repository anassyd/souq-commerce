"use client";
import { useEffect, useState } from "react";

/** Avoids hydration mismatches for values read from localStorage (cart, wishlist). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

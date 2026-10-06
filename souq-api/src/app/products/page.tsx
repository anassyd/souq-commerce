import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories } from "@/lib/dummyjson";
import { ProductsExplorer } from "@/components/products/products-explorer";

export const metadata: Metadata = { title: "Shop all products" };

export default async function ProductsPage() {
  const categories = await getCategories();
  return (
    <Suspense>
      <ProductsExplorer categories={categories} />
    </Suspense>
  );
}

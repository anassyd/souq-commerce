import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container grid place-items-center py-28 text-center">
      <p className="font-display text-8xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-3xl font-bold">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-muted-foreground">The link may be old, or the product was removed.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild><Link href="/">Go home</Link></Button>
        <Button asChild variant="outline"><Link href="/products">Browse products</Link></Button>
      </div>
    </div>
  );
}

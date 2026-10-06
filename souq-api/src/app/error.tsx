"use client";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container grid place-items-center py-28 text-center">
      <h1 className="text-3xl font-bold">Something on this page failed to load</h1>
      <p className="mt-2 text-muted-foreground">Refresh the page or try again in a moment.</p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </div>
  );
}

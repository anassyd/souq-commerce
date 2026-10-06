"use client";

import Image from "next/image";
import Link from "next/link";
import { useOrders } from "@/store/orders";
import { useAuth } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function OrdersList() {
  const user = useAuth((s) => s.user);
  const all = useOrders((s) => s.orders);
  const orders = all.filter((o) => o.userId === user?.id);

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-4xl font-bold">Your orders</h1>
      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-secondary p-10 text-center">
          <p className="font-semibold">You haven&apos;t placed an order yet.</p>
          <Button asChild className="mt-5"><Link href="/products">Start shopping</Link></Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {orders.map((o) => (
            <li key={o.id} className="overflow-hidden rounded-3xl border">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary px-5 py-4 text-sm">
                <div className="flex flex-wrap gap-6">
                  <div><p className="text-muted-foreground">Placed</p><p className="font-semibold">{new Date(o.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</p></div>
                  <div><p className="text-muted-foreground">Total</p><p className="font-semibold">{formatPrice(o.total)}</p></div>
                  <div><p className="text-muted-foreground">Order</p><p className="font-semibold">#{o.id}</p></div>
                  <div><p className="text-muted-foreground">Payment</p><p className="font-semibold">{o.payment === "card" ? `Card ${o.cardLast4}` : "Cash on delivery"}</p></div>
                </div>
                <Badge variant="warning">{o.status}</Badge>
              </div>
              <ul className="divide-y">
                {o.items.map((i) => (
                  <li key={i.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-secondary">
                      <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <Link href={`/products/${i.slug}`} className="flex-1 font-medium hover:underline">
                      {i.name} <span className="text-muted-foreground">× {i.quantity}</span>
                    </Link>
                    <p className="font-semibold">{formatPrice(i.price * i.quantity)}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

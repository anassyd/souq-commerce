"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useOrders } from "@/store/orders";
import { useAuth } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function OrderConfirmation() {
  const id = useSearchParams().get("id");
  const user = useAuth((s) => s.user);
  const order = useOrders((s) => s.orders.find((o) => o.id === id && o.userId === user?.id));

  if (!order) {
    return (
      <div className="container grid place-items-center py-24 text-center">
        <h1 className="text-3xl font-bold">We couldn&apos;t find that order</h1>
        <Button asChild className="mt-6"><Link href="/account/orders">See your orders</Link></Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-16">
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
        <CheckCircle2 className="h-16 w-16 text-emerald-600" />
      </motion.div>
      <h1 className="mt-6 text-4xl font-bold">Thanks, {order.address.fullName.split(" ")[0]}. Your order is in.</h1>
      <p className="mt-3 text-muted-foreground">
        Order #{order.id} will be delivered to {order.address.street}, {order.address.city}.{" "}
        {order.payment === "card" ? `Paid with card ending ${order.cardLast4}.` : "You'll pay in cash on delivery."}
      </p>

      <ul className="mt-8 divide-y rounded-3xl border">
        {order.items.map((i) => (
          <li key={i.id} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-secondary">
              <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{i.name}</p>
              <p className="text-sm text-muted-foreground">Qty {i.quantity}</p>
            </div>
            <p className="font-semibold">{formatPrice(i.price * i.quantity)}</p>
          </li>
        ))}
        <li className="flex justify-between p-4 text-lg font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></li>
      </ul>

      <div className="mt-8 flex gap-3">
        <Button asChild><Link href="/account/orders">View your orders</Link></Button>
        <Button asChild variant="outline"><Link href="/products">Keep shopping</Link></Button>
      </div>
    </div>
  );
}

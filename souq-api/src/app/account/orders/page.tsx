import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { OrdersList } from "@/components/checkout/orders-list";

export const metadata: Metadata = { title: "Your orders" };

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersList />
    </RequireAuth>
  );
}

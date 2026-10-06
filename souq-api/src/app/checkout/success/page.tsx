import { Suspense } from "react";
import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";

export const metadata: Metadata = { title: "Order placed" };

export default function SuccessPage() {
  return (
    <RequireAuth>
      <Suspense>
        <OrderConfirmation />
      </Suspense>
    </RequireAuth>
  );
}

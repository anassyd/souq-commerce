import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderStatus = "Processing" | "Shipped" | "Delivered";

export type Order = {
  id: string;
  userId: string;
  createdAt: string;
  status: OrderStatus;
  items: { id: string; slug: string; name: string; image: string; price: number; quantity: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: "card" | "cod";
  cardLast4?: string;
  address: { fullName: string; phone: string; street: string; city: string; country: string };
};

type OrdersState = {
  orders: Order[];
  place: (order: Omit<Order, "id" | "createdAt" | "status">) => Order;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      place: (data) => {
        const order: Order = {
          ...data,
          id: Math.random().toString(36).slice(2, 10).toUpperCase(),
          createdAt: new Date().toISOString(),
          status: "Processing",
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },
    }),
    { name: "souq-orders" }
  )
);

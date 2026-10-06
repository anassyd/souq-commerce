"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, CreditCard, Lock } from "lucide-react";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { useCart, cartTotal } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useOrders } from "@/store/orders";
import { shippingFor } from "@/lib/shipping";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

const COUNTRIES = ["Egypt", "Saudi Arabia", "United Arab Emirates", "Kuwait", "Qatar", "Jordan", "United States", "United Kingdom"];

const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export function CheckoutForm() {
  const router = useRouter();
  const user = useAuth((s) => s.user)!;
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const place = useOrders((s) => s.place);

  const subtotal = cartTotal(items);
  const shipping = shippingFor(subtotal);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fullName: user.name, country: "Egypt", payment: "card" },
  });
  const payment = watch("payment");
  const placed = useRef(false);

  useEffect(() => {
    if (items.length === 0 && !placed.current) router.replace("/cart");
  }, [items.length, router]);

  const onSubmit = async (v: CheckoutInput) => {
    await new Promise((r) => setTimeout(r, 1200)); // pretend to talk to a payment provider
    const order = place({
      userId: user.id,
      items: items.map(({ id, slug, name, image, price, quantity }) => ({ id, slug, name, image, price, quantity })),
      subtotal,
      shipping,
      total: subtotal + shipping,
      payment: v.payment,
      cardLast4: v.payment === "card" ? v.cardNumber?.replace(/\s/g, "").slice(-4) : undefined,
      address: { fullName: v.fullName, phone: v.phone, street: v.street, city: v.city, country: v.country },
    });
    placed.current = true;
    router.replace(`/checkout/success?id=${order.id}`);
    clear();
  };

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section className="space-y-5">
            <h2 className="text-2xl font-bold">Delivery address</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="fullName" label="Full name" error={errors.fullName?.message}>
                <Input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} {...register("fullName")} />
              </FormField>
              <FormField id="phone" label="Phone" error={errors.phone?.message}>
                <Input id="phone" type="tel" autoComplete="tel" placeholder="+20 100 000 0000" aria-invalid={!!errors.phone} {...register("phone")} />
              </FormField>
            </div>
            <FormField id="street" label="Street and building" error={errors.street?.message}>
              <Input id="street" autoComplete="street-address" aria-invalid={!!errors.street} {...register("street")} />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="city" label="City" error={errors.city?.message}>
                <Input id="city" autoComplete="address-level2" aria-invalid={!!errors.city} {...register("city")} />
              </FormField>
              <FormField id="country" label="Country" error={errors.country?.message}>
                <select id="country" {...register("country")} className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </FormField>
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl font-bold">Payment</h2>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              {[
                { value: "card", label: "Card", desc: "Visa, Mastercard", icon: CreditCard },
                { value: "cod", label: "Cash on delivery", desc: "Pay when it arrives", icon: Banknote },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition",
                    payment === opt.value ? "border-primary bg-accent" : "hover:border-input"
                  )}
                >
                  <input type="radio" value={opt.value} className="sr-only" {...register("payment")} />
                  <opt.icon className="h-6 w-6 text-primary" />
                  <span>
                    <span className="block font-semibold">{opt.label}</span>
                    <span className="block text-sm text-muted-foreground">{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>

            <AnimatePresence initial={false}>
              {payment === "card" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-5 pt-1">
                    <FormField id="cardNumber" label="Card number" error={errors.cardNumber?.message} hint="Demo store: try 4242 4242 4242 4242. Nothing is charged.">
                      <Input
                        id="cardNumber"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="1234 5678 9012 3456"
                        aria-invalid={!!errors.cardNumber}
                        {...register("cardNumber", { onChange: (e) => setValue("cardNumber", formatCard(e.target.value)) })}
                      />
                    </FormField>
                    <div className="grid grid-cols-2 gap-5">
                      <FormField id="expiry" label="Expiry" error={errors.expiry?.message}>
                        <Input
                          id="expiry"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="MM/YY"
                          aria-invalid={!!errors.expiry}
                          {...register("expiry", { onChange: (e) => setValue("expiry", formatExpiry(e.target.value)) })}
                        />
                      </FormField>
                      <FormField id="cvc" label="CVC" error={errors.cvc?.message}>
                        <Input id="cvc" inputMode="numeric" autoComplete="cc-csc" maxLength={4} placeholder="123" aria-invalid={!!errors.cvc} {...register("cvc")} />
                      </FormField>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <aside className="h-fit space-y-5 rounded-3xl bg-secondary p-6 lg:sticky lg:top-32">
          <h2 className="text-xl font-bold">Order summary</h2>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 text-sm">
                <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl bg-background">
                  <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[11px] font-bold text-background">{i.quantity}</span>
                </div>
                <span className="line-clamp-2 flex-1">{i.name}</span>
                <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span className="font-semibold">{shipping ? formatPrice(shipping) : "Free"}</span></div>
          </div>
          <div className="flex justify-between border-t pt-4 text-lg font-bold"><span>Total</span><span>{formatPrice(subtotal + shipping)}</span></div>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            <Lock /> {isSubmitting ? "Placing order…" : payment === "card" ? `Pay ${formatPrice(subtotal + shipping)}` : "Place order"}
          </Button>
          <Link href="/cart" className="block text-center text-sm text-muted-foreground hover:underline">Back to cart</Link>
        </aside>
      </form>
    </div>
  );
}

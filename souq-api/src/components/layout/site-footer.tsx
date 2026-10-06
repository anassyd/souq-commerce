import Link from "next/link";
import { CreditCard, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const PERKS = [
  { icon: Truck, title: "Free delivery", text: "On every order over $50" },
  { icon: RotateCcw, title: "Easy returns", text: "30 days, no questions" },
  { icon: ShieldCheck, title: "Secure checkout", text: "Card details never stored" },
  { icon: CreditCard, title: "Flexible payment", text: "Card or cash on delivery" },
];

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/products?sort=rating", label: "Top rated" },
      { href: "/products?sort=newest", label: "New arrivals" },
      { href: "/products?sort=price-asc", label: "Deals" },
    ],
  },
  {
    title: "Popular",
    links: [
      { href: "/products?category=smartphones", label: "Smartphones" },
      { href: "/products?category=laptops", label: "Laptops" },
      { href: "/products?category=clothing", label: "Clothing" },
      { href: "/products?category=furniture", label: "Furniture" },
    ],
  },
  {
    title: "Your account",
    links: [
      { href: "/account/orders", label: "Orders" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/cart", label: "Cart" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-foreground text-background">
      <div className="border-b border-background/10">
        <ul className="container grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="group flex items-center gap-4">
              <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-background/10 text-deal transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-background/60">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-4xl font-extrabold">souq<span className="text-deal">.</span></p>
          <p className="mt-3 max-w-xs text-sm text-background/60">Everyday products with fair prices, real customer reviews, secure checkout and quick delivery.</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="font-semibold">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-background/60">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-block transition-all hover:translate-x-1 hover:text-background">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-background/10">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-6 text-sm text-background/50">
          <p>© {new Date().getFullYear()} Souq. All rights reserved.</p>
          <p>Made with care for everyday shoppers.</p>
        </div>
      </div>
    </footer>
  );
}

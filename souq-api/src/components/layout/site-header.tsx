"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAuth } from "@/store/auth";
import { AnimatePresence, motion } from "framer-motion";
import { GitCompareArrows, Heart, LogOut, Package, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, cartCount } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useCompare } from "@/store/compare";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/products?category=smartphones", label: "Smartphones" },
  { href: "/products?category=laptops", label: "Laptops" },
  { href: "/products?category=furniture", label: "Furniture" },
  { href: "/products?category=fragrances", label: "Fragrances" },
  { href: "/products?category=clothing", label: "Clothing" },
  { href: "/products?category=mens-shoes", label: "Shoes" },
  { href: "/products?category=skin-care", label: "Skin care" },
  { href: "/products?sort=price-asc", label: "Deals" },
];

const ANNOUNCEMENTS = ["Free delivery on orders over $50", "30-day hassle-free returns", "Pay by card or cash on delivery", "New arrivals every week"];

function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % ANNOUNCEMENTS.length), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative h-9 overflow-hidden bg-foreground text-center text-xs font-medium text-background sm:text-sm">
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -18, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 grid place-items-center"
        >
          {ANNOUNCEMENTS[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/** Category links with a pill that slides to the active one. */
function CategoryNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname === "/products" ? `/products${params.toString() ? `?${params.toString()}` : ""}` : pathname;
  const items = [{ href: "/products", label: "All products" }, ...NAV];
  return (
    <ul className="no-scrollbar container flex gap-1 overflow-x-auto py-2 text-sm font-medium">
      {items.map((n) => {
        const active = current === n.href;
        return (
          <li key={n.label} className="relative">
            {active && (
              <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <Link
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative block whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors",
                active ? "text-background" : n.label === "Deals" ? "text-destructive hover:bg-secondary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {n.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function HeaderSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  useEffect(() => setQ(params.get("q") ?? ""), [params]);
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");
      }}
      className="relative flex-1"
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products"
        aria-label="Search products"
        className="h-11 w-full rounded-full border border-transparent bg-secondary pl-11 pr-24 text-sm transition-all hover:border-input focus:border-input focus:bg-background focus:shadow-lg focus:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2">Search</Button>
    </form>
  );
}

function UserMenu() {
  const mounted = useMounted();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!mounted) return <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />;
  if (!user)
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/login"><User /> Sign in</Link>
      </Button>
    );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="grid h-10 w-10 place-items-center rounded-full bg-accent font-display font-bold text-accent-foreground"
      >
        {user.name[0]?.toUpperCase() ?? "U"}
        <span className="sr-only">Account menu</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-56 origin-top-right rounded-2xl border bg-background p-2 shadow-xl"
          >
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Link href="/account/orders" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-secondary"><Package className="h-4 w-4" /> Your orders</Link>
            <button onClick={() => { logout(); router.push("/"); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-secondary"><LogOut className="h-4 w-4" /> Sign out</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SiteHeader() {
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const wishCount = useWishlist((s) => s.ids.length);
  const compareCount = useCompare((s) => s.items.length);
  const count = mounted ? cartCount(items) : 0;
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <AnnouncementBar />
    <header className={cn("sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-300", scrolled && "shadow-lg shadow-foreground/[0.04]")}>
      <div className="container flex h-[72px] items-center gap-4">
        <Link href="/" className="group font-display text-2xl font-extrabold tracking-tight">
          souq<span className="inline-block text-deal transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-125">.</span>
        </Link>
        <div className="hidden flex-1 md:flex">
          <Suspense fallback={<div className="h-11 flex-1 rounded-full bg-secondary" />}>
            <HeaderSearch />
          </Suspense>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label={`Compare, ${mounted ? compareCount : 0} products`}>
            <Link href="/compare" className="relative">
              <GitCompareArrows className="!h-5 !w-5" />
              {mounted && compareCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[11px] font-bold text-background">
                  {compareCount}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label={`Wishlist, ${mounted ? wishCount : 0} items`}>
            <Link href="/wishlist" className="relative">
              <Heart className="!h-5 !w-5" />
              {mounted && wishCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-deal" />
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={openCart} aria-label={`Open cart, ${count} items`} className="relative">
            <ShoppingBag className="!h-5 !w-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
          <UserMenu />
        </div>
      </div>
      <div className="container pb-3 md:hidden">
        <Suspense fallback={<div className="h-11 rounded-full bg-secondary" />}>
          <HeaderSearch />
        </Suspense>
      </div>
      <nav aria-label="Categories" className="border-t">
        <Suspense fallback={<div className="h-[46px]" />}>
          <CategoryNav />
        </Suspense>
      </nav>
    </header>
    </>
  );
}

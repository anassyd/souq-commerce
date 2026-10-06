"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-foreground px-6 py-14 text-background md:px-14">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 text-background/[0.06]" />
      <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 animate-float rounded-full bg-primary/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-10 -z-10 h-64 w-64 animate-float rounded-full bg-deal/30 blur-3xl [animation-delay:-7s]" />
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold md:text-5xl">Get first dibs on deals</h2>
          <p className="mt-3 max-w-md text-background/70">One short email a week with price drops, new arrivals and the best-rated picks. Unsubscribe any time.</p>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.p
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-full bg-background/10 px-6 py-4 font-semibold"
            >
              <Check className="h-5 w-5 text-deal" /> You&apos;re on the list. Watch your inbox.
            </motion.p>
          ) : (
            <motion.form
              key="form"
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (valid) setDone(true);
              }}
              className="relative"
            >
              <Mail className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-14 w-full rounded-full bg-background pl-14 pr-36 text-foreground focus:outline-none focus:ring-4 focus:ring-deal"
              />
              <Button type="submit" variant="deal" disabled={!valid} className="absolute right-2 top-1/2 -translate-y-1/2">
                Subscribe
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Cat = { id: string; name: string; slug: string; image: string; photo?: boolean; count: number };

// Asymmetric layout: the first category gets the large tile.
const spans = ["md:col-span-2 md:row-span-2", "", "", "md:col-span-2", "", ""];

export function CategoryBento({ categories }: { categories: Cat[] }) {
  return (
    <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:grid-cols-4">
      {categories.map((c, i) => (
        <Link
          key={c.id}
          href={`/products?category=${c.slug}`}
          style={{ animationDelay: `${i * 70}ms` }}
          className={cn(
            "group relative overflow-hidden rounded-3xl bg-secondary duration-700 animate-in fade-in slide-in-from-bottom-6 fill-mode-both",
            "transition-shadow hover:shadow-xl hover:shadow-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            spans[i % spans.length]
          )}
        >
          {c.image && (
            <Image
              src={c.image}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 50vw"
              className={cn(
                "transition-transform duration-700 ease-out group-hover:scale-110",
                c.photo ? "object-cover" : "object-contain p-8 pb-16 mix-blend-multiply group-hover:-rotate-2"
              )}
            />
          )}
          {c.photo && <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />}

          <span className="absolute right-4 top-4 grid h-9 w-9 -translate-x-2 translate-y-2 place-items-center rounded-full bg-background text-foreground opacity-0 shadow-sm transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </span>

          <div className="absolute bottom-4 left-4 right-4 transition-transform duration-300 group-hover:-translate-y-1">
            <p className={cn("font-display font-bold", i === 0 ? "text-3xl" : "text-xl")}>{c.name}</p>
            <p className="text-sm text-muted-foreground">{c.count} products</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

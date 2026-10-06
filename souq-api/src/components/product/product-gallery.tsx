"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name, photo }: { images: string[]; name: string; photo?: boolean }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const select = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  // Zoom is driven by CSS variables on the stage so mouse moves don't re-render React.
  const setOrigin = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      <div className="flex gap-3 md:flex-col" role="tablist" aria-label="Product images">
        {images.map((src, i) => (
          <motion.button
            key={src}
            role="tab"
            aria-selected={i === index}
            aria-label={`Image ${i + 1}`}
            onClick={() => select(i)}
            initial={{ y: 8 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative h-20 w-20 rounded-xl bg-secondary transition-opacity",
              i === index ? "opacity-100" : "opacity-60 hover:opacity-100"
            )}
          >
            <Image src={src} alt="" fill sizes="80px" className={cn("rounded-xl", photo ? "object-cover" : "object-contain p-1 mix-blend-multiply")} />
            {i === index && (
              <motion.span
                layoutId="gallery-thumb-ring"
                className="pointer-events-none absolute inset-0 z-10 rounded-xl border-2 border-primary"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </motion.button>
        ))}
      </div>
      <div
        className="group/zoom relative isolate aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-secondary [--zx:50%] [--zy:50%]"
        onPointerEnter={(e) => e.pointerType === "mouse" && setOrigin(e)}
        onPointerMove={(e) => e.pointerType === "mouse" && setOrigin(e)}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={images[index]}
            custom={direction}
            // bg-secondary on the slide keeps mix-blend-multiply blending against grey while it fades.
            className="absolute inset-0 bg-secondary"
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 40 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -40 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={images[index]}
              alt={name}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className={cn(photo ? "object-cover" : "object-contain p-8 mix-blend-multiply", "transition-transform duration-300 ease-out [transform-origin:var(--zx)_var(--zy)] [@media(hover:hover)]:group-hover/zoom:scale-[1.8]")}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

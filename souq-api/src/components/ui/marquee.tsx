import { cn } from "@/lib/utils";

/** Endless horizontal scroller. Content is rendered twice so the loop is seamless; pauses on hover. */
export function Marquee({ children, seconds = 40, className }: { children: React.ReactNode; seconds?: number; className?: string }) {
  return (
    <div className={cn("group mask-fade-x flex overflow-hidden", className)}>
      <div
        className="flex w-max flex-none animate-marquee items-center group-hover:[animation-play-state:paused]"
        style={{ "--marquee-duration": `${seconds}s` } as React.CSSProperties}
      >
        <div className="flex flex-none items-center">{children}</div>
        <div className="flex flex-none items-center" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

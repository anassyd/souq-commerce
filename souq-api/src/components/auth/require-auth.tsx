"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
import { useMounted } from "@/lib/use-mounted";
import { Skeleton } from "@/components/ui/skeleton";

/** Client-side route guard. Sends signed-out visitors to /login and brings them back afterwards. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const user = useAuth((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (mounted && !user) router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
  }, [mounted, user, router, pathname]);

  if (!mounted || !user) return <div className="container py-10"><Skeleton className="h-96" /></div>;
  return <>{children}</>;
}

/** Sends signed-in users away from /login and /register. */
export function RedirectIfAuthed({ to = "/" }: { to?: string }) {
  const mounted = useMounted();
  const router = useRouter();
  // Only checks once on arrival, so it doesn't fight the redirect that runs right after logging in.
  useEffect(() => {
    if (mounted && useAuth.getState().user) router.replace(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);
  return null;
}

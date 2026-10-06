import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="container grid gap-10 py-8 lg:grid-cols-[1.1fr_1fr]">
      <Skeleton className="aspect-square rounded-3xl" />
      <div className="space-y-4 pt-4"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-5 w-40" /><Skeleton className="h-12 w-48" /><Skeleton className="h-24" /><Skeleton className="h-12" /></div>
    </div>
  );
}

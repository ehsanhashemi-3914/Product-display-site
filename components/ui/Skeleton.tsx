import { cn } from "@/lib/format";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-sand-200/70", className)}
    />
  );
}

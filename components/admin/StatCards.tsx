import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/format";
import { Skeleton } from "@/components/ui/Skeleton";

export interface StatCardItem {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "brand" | "success" | "danger" | "neutral";
}

const TONES: Record<StatCardItem["tone"], string> = {
  brand: "bg-brand-50 text-brand-700",
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-rose-50 text-rose-700",
  neutral: "bg-sand-100 text-ink-muted",
};

export function StatCards({
  items,
  loading = false,
}: {
  items: StatCardItem[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-line bg-surface p-5 shadow-card"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-7 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5 shadow-card"
        >
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg",
              TONES[item.tone],
            )}
          >
            <item.icon aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <dt className="truncate text-sm text-ink-muted">{item.label}</dt>
            <dd className="mt-0.5 text-xl font-bold text-ink">{item.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

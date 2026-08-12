import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export type BadgeTone = "brand" | "gold" | "neutral" | "success" | "danger" | "info";

const TONES: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-700 border-brand-200",
  gold: "bg-gold-50 text-gold-700 border-gold-200",
  neutral: "bg-sand-100 text-ink-muted border-line",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1",
        "text-xs leading-none font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

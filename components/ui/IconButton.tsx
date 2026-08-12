import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/format";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only controls have no accessible name of their own. */
  label: string;
  tone?: "neutral" | "danger";
  /** React 19 passes refs as ordinary props — no forwardRef wrapper needed. */
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

export function IconButton({
  label,
  tone = "neutral",
  className,
  children,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent",
        "transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-40",
        tone === "danger"
          ? "text-rose-600 hover:bg-rose-50 hover:border-rose-200"
          : "text-ink-muted hover:bg-sand-100 hover:text-ink hover:border-line",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

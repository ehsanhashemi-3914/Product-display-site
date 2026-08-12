import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/format";

const CONTROL_BASE =
  "w-full rounded-lg border bg-surface text-ink placeholder:text-ink-subtle " +
  "transition-colors focus-ring disabled:cursor-not-allowed disabled:bg-sand-100 " +
  "aria-[invalid=true]:border-rose-400 aria-[invalid=true]:focus-visible:ring-rose-500";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(CONTROL_BASE, "h-11 border-line-strong px-3 text-sm", className)}
      {...props}
    />
  );
}

export function Textarea({
  className,
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        CONTROL_BASE,
        "resize-y border-line-strong px-3 py-2.5 text-sm leading-7",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        CONTROL_BASE,
        "h-11 cursor-pointer appearance-none border-line-strong px-3 text-sm",
        // Chevron drawn as an inline SVG background so no icon component is needed here.
        "bg-[length:1rem] bg-no-repeat bg-[position:left_0.75rem_center]",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23756757%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
        "ps-3 pe-9",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

import { cn } from "@/lib/format";

/** Stylised مهر (pressed clay tablet) used as the site's logo mark. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={cn("size-11", className)}
    >
      <circle cx="24" cy="24" r="23" className="fill-brand-600" />
      <circle
        cx="24"
        cy="24"
        r="17"
        className="fill-none stroke-brand-200"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <g
        className="stroke-brand-100"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M15 19h18" />
        <path d="M18 25h12" />
        <path d="M21 31h6" />
      </g>
    </svg>
  );
}

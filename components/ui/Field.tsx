import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export interface FieldRenderProps {
  id: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
}

export interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  /**
   * Render-prop so the accessibility wiring (`id`, `aria-invalid`, `aria-describedby`)
   * can never drift from the label and error message rendered here.
   */
  children: (props: FieldRenderProps) => ReactNode;
}

export function Field({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ms-1 text-rose-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}

      {hint && !error && (
        <p id={hintId} className="text-xs leading-5 text-ink-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs leading-5 font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

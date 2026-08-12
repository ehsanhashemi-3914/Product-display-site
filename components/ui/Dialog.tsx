"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/format";
import { IconButton } from "./IconButton";

export type DialogSize = "sm" | "md" | "lg";

const SIZES: Record<DialogSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-4xl",
};

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: DialogSize;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Modal built on the native <dialog> element.
 *
 * `showModal()` gives focus trapping, Escape-to-close, focus restoration and background
 * inertness from the platform — all the parts a hand-rolled modal usually gets wrong.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;

    // Only record a target that lives *outside* the dialog. Strict Mode re-runs this
    // effect after showModal() has already pulled focus inside, and that node is gone
    // once the dialog unmounts — capturing it would lose the real return target.
    const active = document.activeElement;
    if (active instanceof HTMLElement && !element.contains(active)) {
      restoreFocusRef.current = active;
    }

    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();

    // showModal() blocks interaction but not scrolling — lock the page ourselves.
    document.documentElement.style.overflow = open ? "hidden" : "";

    return () => {
      document.documentElement.style.overflow = "";
      // Callers usually unmount the dialog to close it, which tears the element out of
      // the DOM while it is still open. The UA's own focus restoration doesn't run on
      // that path, and pulling an open modal out of the top layer resets focus to
      // <body> — after this cleanup — so a synchronous restore would be clobbered.
      // Defer past the removal and put focus back where the user left it. A timer
      // rather than requestAnimationFrame: rAF is throttled to zero in a backgrounded
      // or non-compositing tab, which would silently drop the restore.
      const target = restoreFocusRef.current;
      if (target) {
        setTimeout(() => {
          if (target.isConnected) target.focus({ preventScroll: true });
        }, 0);
      }
    };
  }, [open]);

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;

    // `cancel` precedes the UA's own Escape close. Preventing it and closing through
    // React keeps the open state, the scroll lock and focus restoration in one place —
    // otherwise the element can end up visually closed while React still thinks it's open.
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    // Safety net for any other native close (e.g. form method="dialog").
    const handleNativeClose = () => onClose();

    element.addEventListener("cancel", handleCancel);
    element.addEventListener("close", handleNativeClose);
    return () => {
      element.removeEventListener("cancel", handleCancel);
      element.removeEventListener("close", handleNativeClose);
    };
  }, [onClose]);

  /** Focus is trapped inside the modal, so Escape always reaches this handler. */
  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    onClose();
  }

  // With `p-0` the dialog box is exactly its content, so a click reported on the
  // dialog itself can only have come from the backdrop.
  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line",
        "bg-surface p-0 text-ink shadow-overlay",
        SIZES[size],
      )}
    >
      <div className="flex max-h-[calc(100dvh-4rem)] flex-col">
        <header className="flex items-start gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base leading-7 font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm leading-6 text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <IconButton label="بستن" onClick={onClose} className="-me-1.5">
            <X aria-hidden="true" className="size-5" />
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-sand-50 px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}

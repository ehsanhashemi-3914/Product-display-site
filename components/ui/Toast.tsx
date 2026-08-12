"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/format";

export type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 5000;

const VARIANT_STYLES: Record<ToastVariant, { className: string; Icon: typeof Info }> = {
  success: { className: "border-emerald-200 bg-emerald-50 text-emerald-900", Icon: CircleCheck },
  error: { className: "border-rose-200 bg-rose-50 text-rose-900", Icon: CircleAlert },
  info: { className: "border-line bg-surface text-ink", Icon: Info },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      nextId.current += 1;
      const id = nextId.current;
      setItems((current) => [...current, { id, message, variant }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/*
        Always mounted so assistive tech has a live region to observe; toasts are
        appended into it rather than the region itself appearing on demand.
      */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:start-6 sm:bottom-6 sm:w-96"
      >
        {items.map((item) => {
          const { className, Icon } = VARIANT_STYLES[item.variant];
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-card-hover",
                className,
              )}
            >
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <p className="flex-1 text-sm leading-6 font-medium">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="بستن پیام"
                className="focus-ring -me-1 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast باید داخل <ToastProvider> استفاده شود.");
  }
  return context;
}

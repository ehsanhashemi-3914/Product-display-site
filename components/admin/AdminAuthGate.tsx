"use client";

import type { ReactNode } from "react";
import { useAdminSession } from "@/lib/hooks/useAdminSession";
import { AdminLogin } from "./AdminLogin";

/**
 * Wraps every admin route. Because it lives in `app/admin/layout.tsx`, typing any admin
 * URL directly — including a deep link like /admin/products/<id>/edit — lands on the
 * password screen first, and unlocking reveals the page that was originally requested.
 */
export function AdminAuthGate({ children }: { children: ReactNode }) {
  const status = useAdminSession();

  if (status === "checking") {
    // Only the browser knows whether this device is unlocked. Render a neutral shell
    // during hydration so an already-signed-in owner never sees the login form flash.
    return (
      <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
        <span className="sr-only">در حال بررسی دسترسی…</span>
        <div
          aria-hidden="true"
          className="size-8 animate-spin rounded-full border-2 border-line border-t-brand-600"
        />
      </div>
    );
  }

  if (status === "locked") return <AdminLogin />;

  return <>{children}</>;
}

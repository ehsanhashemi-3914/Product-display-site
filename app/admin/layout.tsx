import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "پنل مدیریت",
    template: "%s | پنل مدیریت",
  },
  // The admin panel is a management surface, not a page for search engines.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthGate>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGate>
  );
}

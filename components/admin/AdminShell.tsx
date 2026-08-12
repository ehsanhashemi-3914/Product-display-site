"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Palette,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import { lockAdmin } from "@/lib/auth/admin-session";
import { cn } from "@/lib/format";
import { SITE } from "@/lib/config/site";
import { BrandLogo } from "@/components/products/BrandLogo";
import { IconButton } from "@/components/ui/IconButton";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "همهٔ محصولات", icon: Package },
  { href: "/admin/products/new", label: "افزودن محصول", icon: Plus, exact: true },
  { href: "/admin/settings", label: "تنظیمات و پشتیبان", icon: Palette },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    drawerRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-full flex-1 bg-canvas">
      <aside className="hidden w-64 shrink-0 border-e border-line bg-surface lg:flex lg:flex-col">
        <SidebarContent pathname={pathname} />
      </aside>


      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <IconButton
            ref={menuButtonRef}
            label="باز کردن منو"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu aria-hidden="true" className="size-5" />
          </IconButton>
          <span className="flex items-center gap-2 text-sm font-bold text-ink">
            <BrandLogo className="size-8" />
            پنل مدیریت
          </span>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-brand-900/50"
          />
          <div
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="منوی پنل مدیریت"
            className="absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-overlay outline-none"
          >
            <div className="flex justify-end p-2">
              <IconButton label="بستن منو" onClick={() => setDrawerOpen(false)}>
                <X aria-hidden="true" className="size-5" />
              </IconButton>
            </div>
            {/* Links close the drawer themselves — navigation is the only way out. */}
            <SidebarContent pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-line px-5 py-5">
        <BrandLogo className="size-10 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">پنل مدیریت</p>
          <p className="truncate text-xs text-ink-muted">{SITE.name}</p>
        </div>
      </div>

      <nav aria-label="منوی اصلی پنل مدیریت" className="flex-1 p-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-50 text-brand-800"
                      : "text-ink-muted hover:bg-sand-100 hover:text-ink",
                  )}
                >
                  <item.icon aria-hidden="true" className="size-4.5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-1 border-t border-line p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-sand-100 hover:text-ink"
        >
          <ExternalLink aria-hidden="true" className="size-4.5 shrink-0" />
          مشاهدهٔ سایت
        </Link>
        <button
          type="button"
          onClick={() => void lockAdmin()}
          className="focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut aria-hidden="true" className="size-4.5 shrink-0" />
          خروج از پنل
        </button>
      </div>
    </>
  );
}

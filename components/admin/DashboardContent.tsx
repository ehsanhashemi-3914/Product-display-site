"use client";

import Link from "next/link";
import {
  CircleSlash,
  ExternalLink,
  LayoutGrid,
  Package,
  PackageOpen,
  Pencil,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { useProducts } from "@/lib/hooks/useProducts";
import { categoryName } from "@/lib/products/seed";
import { effectivePrice, formatDate, formatToman, toPersianDigits } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductPhoto } from "@/components/products/ProductPhoto";
import { StatusPill } from "@/components/products/StatusPill";
import { StatCards, type StatCardItem } from "./StatCards";

export function DashboardContent() {
  const { products, source } = useProducts();
  // `seed` means the browser hasn't reported its stored catalogue yet.
  const loading = source === "seed";

  const available = products.filter((product) => product.status === "available").length;
  const outOfStock = products.filter((product) => product.status === "out_of_stock").length;
  const categories = new Set(products.map((product) => product.category)).size;

  const stats: StatCardItem[] = [
    { label: "کل محصولات", value: toPersianDigits(products.length), icon: Package, tone: "brand" },
    { label: "موجود", value: toPersianDigits(available), icon: ShoppingBag, tone: "success" },
    { label: "ناموجود", value: toPersianDigits(outOfStock), icon: CircleSlash, tone: "danger" },
    { label: "دسته‌بندی‌های فعال", value: toPersianDigits(categories), icon: LayoutGrid, tone: "neutral" },
  ];

  const recent = [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <StatCards items={stats} loading={loading} />

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="rounded-xl border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold text-ink">آخرین محصولات</h2>
              <Link
                href="/admin/products"
                className="focus-ring rounded-md text-xs font-medium text-brand-700 transition-colors hover:text-brand-800"
              >
                مشاهدهٔ همه
              </Link>
            </div>

            {loading ? (
              <ul className="divide-y divide-line">
                {Array.from({ length: 4 }, (_, index) => (
                  <li key={index} className="flex items-center gap-4 px-5 py-4">
                    <Skeleton className="size-14 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : recent.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={PackageOpen}
                  title="هنوز محصولی ثبت نشده است"
                  description="اولین محصول خود را اضافه کنید تا در صفحهٔ فروشگاه نمایش داده شود."
                  action={
                    <LinkButton href="/admin/products/new">افزودن محصول</LinkButton>
                  }
                  className="border-0 py-8"
                />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {recent.map((product) => (
                  <li key={product.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-line bg-sand-100">
                      <ProductPhoto image={product.images[0]} fallbackAlt={product.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                      <p className="mt-1 truncate text-xs text-ink-subtle">
                        {categoryName(product.category)} ·{" "}
                        {formatToman(effectivePrice(product.price, product.discountPercent))} ·
                        افزوده‌شده {formatDate(product.createdAt)}
                      </p>
                    </div>
                    <div className="hidden shrink-0 sm:block">
                      <StatusPill status={product.status} />
                    </div>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      aria-label={`ویرایش ${product.name}`}
                      className="focus-ring inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-sand-100 hover:text-ink"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <h2 className="text-sm font-semibold text-ink">دسترسی سریع</h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/admin/products/new"
              className="focus-ring flex items-center gap-3 rounded-lg border border-line px-3 py-3 text-sm font-medium text-ink transition-colors hover:bg-sand-50"
            >
              <Plus aria-hidden="true" className="size-4 text-brand-600" />
              افزودن محصول جدید
            </Link>
            <Link
              href="/admin/products"
              className="focus-ring flex items-center gap-3 rounded-lg border border-line px-3 py-3 text-sm font-medium text-ink transition-colors hover:bg-sand-50"
            >
              <Package aria-hidden="true" className="size-4 text-brand-600" />
              مدیریت محصولات
            </Link>
            <Link
              href="/"
              className="focus-ring flex items-center gap-3 rounded-lg border border-line px-3 py-3 text-sm font-medium text-ink transition-colors hover:bg-sand-50"
            >
              <ExternalLink aria-hidden="true" className="size-4 text-brand-600" />
              مشاهدهٔ صفحهٔ فروشگاه
            </Link>
          </div>

          <p className="mt-5 rounded-lg bg-sand-50 px-3 py-3 text-xs leading-6 text-ink-muted">
            تغییرات در همین مرورگر ذخیره می‌شود و بلافاصله در صفحهٔ فروشگاه نمایش داده
            می‌شود.
          </p>
        </section>
      </div>
    </div>
  );
}

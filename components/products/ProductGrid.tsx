"use client";

import { useState } from "react";
import { PackageOpen, TriangleAlert } from "lucide-react";
import type { Product } from "@/types/product";
import { useProducts } from "@/lib/hooks/useProducts";
import { toPersianDigits } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "./ProductCard";
import { ProductGridSkeleton } from "./ProductGridSkeleton";
import { ProductQuickView } from "./ProductQuickView";

/**
 * The 2-per-row grid from the reference drawing, widened to 3 columns on desktop so
 * cards keep sane proportions on large screens.
 *
 * Reads the same shared store the admin panel writes to — an edit in /admin shows up
 * here without a reload, and in another tab via the storage event.
 */
export function ProductGrid({
  initialProducts = [],
}: {
  /** Server-rendered catalogue, shown until the browser's own fetch lands. */
  initialProducts?: readonly Product[];
}) {
  const snapshot = useProducts();
  const { status, error, source } = snapshot;
  const products = source === "store" ? snapshot.products : initialProducts;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derived from the live list, so an edit or delete elsewhere can't strand a stale modal.
  const selected = selectedId
    ? (products.find((product) => product.id === selectedId) ?? null)
    : null;

  if (status === "loading") return <ProductGridSkeleton />;

  if (status === "error") {
    return (
      <EmptyState
        icon={TriangleAlert}
        title="خواندن فهرست محصولات ممکن نشد"
        description={error ?? "لطفاً صفحه را دوباره بارگذاری کنید."}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="هنوز محصولی ثبت نشده است"
        description="به‌زودی محصولات جدید در این صفحه نمایش داده می‌شوند."
      />
    );
  }

  return (
    <>
      <p className="mb-5 text-sm text-ink-muted">
        {toPersianDigits(products.length)} محصول
      </p>

      <ul
        role="list"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
      >
        {products.map((product, index) => (
          <li key={product.id} className="flex">
            <ProductCard
              product={product}
              onOpen={() => setSelectedId(product.id)}
              eagerImage={index < 3}
              className="w-full"
            />
          </li>
        ))}
      </ul>

      {selected && (
        <ProductQuickView
          key={selected.id}
          product={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  PackageOpen,
  RotateCcw,
  SearchX,
  TriangleAlert,
} from "lucide-react";
import type { CategoryId, Product, ProductStatus } from "@/types/product";
import { useProducts } from "@/lib/hooks/useProducts";
import { productService } from "@/lib/products/product-service";
import { toErrorMessage } from "@/lib/products/store";
import { CATEGORIES, STATUS_LABELS } from "@/lib/products/seed";
import { PRODUCT_STATUSES } from "@/types/product";
import { toPersianDigits } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Input";
import { LinkButton } from "@/components/ui/LinkButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { ProductMobileCard } from "./ProductMobileCard";
import { ProductTable } from "./ProductTable";
import { ResetCatalogueDialog } from "./ResetCatalogueDialog";

type CategoryFilter = CategoryId | "all";
type StatusFilter = ProductStatus | "all";

export function ProductListView() {
  const { products, status, source, error } = useProducts();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);

  const loading = source === "seed";
  const filtersActive =
    query.trim() !== "" || category !== "all" || statusFilter !== "all";

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      if (category !== "all" && product.category !== category) return false;
      if (statusFilter !== "all" && product.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle)
      );
    });
  }, [products, query, category, statusFilter]);

  async function handleMove(id: string, direction: "up" | "down") {
    setMovingId(id);
    try {
      await productService.move(id, direction);
    } catch (moveError) {
      toast(toErrorMessage(moveError), "error");
    } finally {
      setMovingId(null);
    }
  }

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setStatusFilter("all");
  }

  const actions = {
    onDelete: setDeleteTarget,
    onMove: handleMove,
    // Moving a row while rows are hidden would produce a confusing result.
    reorderEnabled: !filtersActive,
    busyId: movingId,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center">
        <div className="flex-1">
          <label htmlFor="product-search" className="sr-only">
            جست‌وجو در محصولات
          </label>
          <Input
            id="product-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جست‌وجوی نام یا توضیحات محصول…"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:w-auto">
          <div>
            <label htmlFor="filter-category" className="sr-only">
              فیلتر دسته‌بندی
            </label>
            <Select
              id="filter-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as CategoryFilter)}
              className="sm:w-44"
            >
              <option value="all">همهٔ دسته‌ها</option>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="filter-status" className="sr-only">
              فیلتر وضعیت
            </label>
            <Select
              id="filter-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="sm:w-36"
            >
              <option value="all">همهٔ وضعیت‌ها</option>
              {PRODUCT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {STATUS_LABELS[item]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {!loading && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">
            نمایش {toPersianDigits(filtered.length)} از {toPersianDigits(products.length)}{" "}
            محصول
            {!actions.reorderEnabled && products.length > 0 && (
              <span className="ms-2 text-xs text-ink-subtle">
                (برای تغییر ترتیب، فیلترها را پاک کنید)
              </span>
            )}
          </p>
          <Button variant="ghost" size="sm" onClick={() => setResetOpen(true)}>
            <RotateCcw aria-hidden="true" className="size-4" />
            بازنشانی به داده‌های اولیه
          </Button>
        </div>
      )}

      {loading ? (
        <ListSkeleton />
      ) : status === "error" ? (
        <EmptyState
          icon={TriangleAlert}
          title="خواندن محصولات ممکن نشد"
          description={error ?? "لطفاً صفحه را دوباره بارگذاری کنید."}
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="هنوز محصولی ثبت نشده است"
          description="اولین محصول خود را اضافه کنید تا بلافاصله در صفحهٔ فروشگاه نمایش داده شود."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <LinkButton href="/admin/products/new">افزودن اولین محصول</LinkButton>
              <Button variant="secondary" onClick={() => setResetOpen(true)}>
                بازگرداندن محصولات نمونه
              </Button>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="محصولی با این فیلترها پیدا نشد"
          description="عبارت جست‌وجو یا فیلترهای دسته‌بندی و وضعیت را تغییر دهید."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              پاک کردن فیلترها
            </Button>
          }
        />
      ) : (
        <>
          <div className="hidden md:block">
            <ProductTable products={filtered} {...actions} />
          </div>

          <ul className="space-y-3 md:hidden">
            {filtered.map((product, index) => (
              <ProductMobileCard
                key={product.id}
                product={product}
                isFirst={index === 0}
                isLast={index === filtered.length - 1}
                {...actions}
              />
            ))}
          </ul>
        </>
      )}

      {deleteTarget && (
        <DeleteProductDialog
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {resetOpen && <ResetCatalogueDialog onClose={() => setResetOpen(false)} />}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 shadow-card"
        >
          <Skeleton className="size-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="hidden h-7 w-20 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}

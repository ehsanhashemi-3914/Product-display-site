"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/types/product";
import { categoryName } from "@/lib/products/seed";
import { effectivePrice, formatNumber, formatToman, toPersianDigits } from "@/lib/format";
import { IconButton } from "@/components/ui/IconButton";
import { ProductPhoto } from "@/components/products/ProductPhoto";
import { StatusPill } from "@/components/products/StatusPill";
import type { ProductListActions } from "./productListActions";

export interface ProductTableProps extends ProductListActions {
  products: readonly Product[];
}

const CELL = "px-4 py-3 align-middle";

export function ProductTable({
  products,
  onDelete,
  onMove,
  reorderEnabled,
  busyId,
}: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-card">
      <table className="w-full min-w-[54rem] border-collapse text-sm">
        <caption className="sr-only">فهرست محصولات فروشگاه</caption>
        <thead>
          <tr className="border-b border-line bg-sand-50 text-start text-xs text-ink-muted">
            <th scope="col" className={`${CELL} font-medium`}>
              تصویر
            </th>
            <th scope="col" className={`${CELL} text-start font-medium`}>
              نام محصول
            </th>
            <th scope="col" className={`${CELL} text-start font-medium`}>
              دسته‌بندی
            </th>
            <th scope="col" className={`${CELL} text-start font-medium`}>
              قیمت
            </th>
            <th scope="col" className={`${CELL} text-start font-medium`}>
              وضعیت
            </th>
            <th scope="col" className={`${CELL} text-start font-medium`}>
              ترتیب
            </th>
            <th scope="col" className={`${CELL} text-start font-medium`}>
              عملیات
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((product, index) => {
            const finalPrice = effectivePrice(product.price, product.discountPercent);
            const busy = busyId === product.id;
            return (
              <tr key={product.id} className="transition-colors hover:bg-sand-50/70">
                <td className={CELL}>
                  <div className="size-14 overflow-hidden rounded-lg border border-line bg-sand-100">
                    <ProductPhoto image={product.images[0]} fallbackAlt={product.name} />
                  </div>
                </td>

                <td className={`${CELL} max-w-xs`}>
                  <p className="font-medium text-ink">{product.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-ink-subtle">
                    {product.description}
                  </p>
                  {product.badge && (
                    <span className="mt-1.5 inline-flex rounded-full bg-gold-50 px-2 py-0.5 text-xs font-medium text-gold-700">
                      {product.badge}
                    </span>
                  )}
                </td>

                <td className={`${CELL} whitespace-nowrap text-ink-muted`}>
                  {categoryName(product.category)}
                </td>

                <td className={`${CELL} whitespace-nowrap`}>
                  <span className="font-medium text-ink">{formatToman(finalPrice)}</span>
                  {Boolean(product.discountPercent) && (
                    <span className="mt-0.5 block text-xs text-ink-subtle">
                      <span className="line-through">{formatNumber(product.price)}</span>{" "}
                      · {toPersianDigits(product.discountPercent ?? 0)}٪ تخفیف
                    </span>
                  )}
                </td>

                <td className={CELL}>
                  <StatusPill status={product.status} />
                </td>

                <td className={CELL}>
                  <div className="flex items-center gap-1">
                    <IconButton
                      label={`انتقال «${product.name}» به بالا`}
                      disabled={!reorderEnabled || index === 0 || busy}
                      onClick={() => onMove(product.id, "up")}
                    >
                      <ArrowUp aria-hidden="true" className="size-4" />
                    </IconButton>
                    <IconButton
                      label={`انتقال «${product.name}» به پایین`}
                      disabled={!reorderEnabled || index === products.length - 1 || busy}
                      onClick={() => onMove(product.id, "down")}
                    >
                      <ArrowDown aria-hidden="true" className="size-4" />
                    </IconButton>
                    <span className="ms-1 text-xs text-ink-subtle">
                      {toPersianDigits(product.order + 1)}
                    </span>
                  </div>
                </td>

                <td className={CELL}>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      aria-label={`ویرایش ${product.name}`}
                      title="ویرایش"
                      className="focus-ring inline-flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-sand-100 hover:text-ink"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </Link>
                    <IconButton
                      label={`حذف ${product.name}`}
                      tone="danger"
                      onClick={() => onDelete(product)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

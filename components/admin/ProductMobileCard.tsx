"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/types/product";
import { categoryName } from "@/lib/products/seed";
import { effectivePrice, formatToman, toPersianDigits } from "@/lib/format";
import { IconButton } from "@/components/ui/IconButton";
import { ProductPhoto } from "@/components/products/ProductPhoto";
import { StatusPill } from "@/components/products/StatusPill";
import type { ProductListActions } from "./productListActions";

export interface ProductMobileCardProps extends ProductListActions {
  product: Product;
  isFirst: boolean;
  isLast: boolean;
}

/** Purpose-built small-screen row — not a shrunken table. */
export function ProductMobileCard({
  product,
  isFirst,
  isLast,
  onDelete,
  onMove,
  reorderEnabled,
  busyId,
}: ProductMobileCardProps) {
  const busy = busyId === product.id;

  return (
    <li className="rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="flex gap-3.5">
        <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-line bg-sand-100">
          <ProductPhoto image={product.images[0]} fallbackAlt={product.name} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm leading-6 font-semibold text-ink">{product.name}</p>
          <p className="mt-0.5 text-xs text-ink-subtle">
            {categoryName(product.category)} · ردیف {toPersianDigits(product.order + 1)}
          </p>
          <p className="mt-1.5 text-sm font-medium text-ink">
            {formatToman(effectivePrice(product.price, product.discountPercent))}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusPill status={product.status} />
            {product.badge && (
              <span className="rounded-full bg-gold-50 px-2 py-0.5 text-xs font-medium text-gold-700">
                {product.badge}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-1">
          <IconButton
            label={`انتقال «${product.name}» به بالا`}
            disabled={!reorderEnabled || isFirst || busy}
            onClick={() => onMove(product.id, "up")}
          >
            <ArrowUp aria-hidden="true" className="size-4" />
          </IconButton>
          <IconButton
            label={`انتقال «${product.name}» به پایین`}
            disabled={!reorderEnabled || isLast || busy}
            onClick={() => onMove(product.id, "down")}
          >
            <ArrowDown aria-hidden="true" className="size-4" />
          </IconButton>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium text-ink transition-colors hover:bg-sand-100"
          >
            <Pencil aria-hidden="true" className="size-3.5" />
            ویرایش
          </Link>
          <IconButton
            label={`حذف ${product.name}`}
            tone="danger"
            onClick={() => onDelete(product)}
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </IconButton>
        </div>
      </div>
    </li>
  );
}

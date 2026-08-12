"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { categoryName } from "@/lib/products/seed";
import { cn } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { PriceTag } from "./PriceTag";
import { ProductPhoto } from "./ProductPhoto";
import { StatusPill } from "./StatusPill";

export interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
}

/** Full product detail without leaving the catalogue page. */
export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = product.images;
  const active = images[Math.min(activeIndex, Math.max(images.length - 1, 0))];

  return (
    <Dialog open onClose={onClose} title={product.name} size="lg">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-line bg-sand-100">
            <ProductPhoto image={active} fallbackAlt={product.name} loading="eager" />
            {product.badge && (
              <span className="absolute top-3 start-3 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-bold text-white">
                {product.badge}
              </span>
            )}
          </div>

          {images.length > 1 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {images.map((image, index) => (
                <li key={image.id}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-current={index === activeIndex || undefined}
                    className={cn(
                      "focus-ring size-16 overflow-hidden rounded-lg border-2 transition-colors",
                      index === activeIndex
                        ? "border-brand-600"
                        : "border-line hover:border-line-strong",
                    )}
                  >
                    <ProductPhoto image={image} fallbackAlt={`${product.name} — تصویر ${index + 1}`} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <PriceTag
            price={product.price}
            discountPercent={product.discountPercent}
            size="lg"
          />

          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={product.status} />
            <Badge tone="neutral">{categoryName(product.category)}</Badge>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">توضیحات</h3>
            <p className="mt-2 text-sm leading-8 whitespace-pre-line text-ink-muted">
              {product.description}
            </p>
          </div>

          {product.specs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-ink">اطلاعات تکمیلی</h3>
              <dl className="mt-2 divide-y divide-line overflow-hidden rounded-lg border border-line">
                {product.specs.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex items-start justify-between gap-4 bg-sand-50/60 px-3 py-2.5 text-sm"
                  >
                    <dt className="shrink-0 text-ink-subtle">{spec.label}</dt>
                    <dd className="text-end font-medium text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

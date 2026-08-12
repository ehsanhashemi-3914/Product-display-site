"use client";

import type { Product } from "@/types/product";
import { categoryName } from "@/lib/products/seed";
import { cn, toPersianDigits } from "@/lib/format";
import { PriceTag } from "./PriceTag";
import { ProductPhoto } from "./ProductPhoto";
import { StatusPill } from "./StatusPill";

export interface ProductCardProps {
  product: Product;
  /** Omitted in the admin preview panel, where the card is a static rendering. */
  onOpen?: (product: Product) => void;
  eagerImage?: boolean;
  className?: string;
}

/**
 * The card from the reference drawing: تصویر → نام → قیمت → توضیحات.
 *
 * Shared verbatim between the public grid and the admin preview panel so the owner
 * always sees exactly what customers will see.
 */
export function ProductCard({
  product,
  onOpen,
  eagerImage = false,
  className,
}: ProductCardProps) {
  const interactive = Boolean(onOpen);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card",
        interactive &&
          "transition-shadow duration-150 hover:shadow-card-hover focus-within:shadow-card-hover",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-sand-100">
        <ProductPhoto
          image={product.images[0]}
          fallbackAlt={product.name}
          loading={eagerImage ? "eager" : "lazy"}
          className={cn(
            interactive && "transition-transform duration-200 group-hover:scale-[1.03]",
          )}
        />

        {product.badge && (
          <span className="absolute top-3 start-3 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-bold text-white shadow-card">
            {product.badge}
          </span>
        )}
        {Boolean(product.discountPercent) && (
          <span className="absolute top-3 end-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-card">
            {toPersianDigits(product.discountPercent ?? 0)}٪
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <h3 className="text-base leading-7 font-bold text-ink">{product.name}</h3>

        <PriceTag price={product.price} discountPercent={product.discountPercent} />

        <p className="line-clamp-2 text-sm leading-7 text-ink-muted">
          {product.description}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <StatusPill status={product.status} />
          <span className="text-xs text-ink-subtle">{categoryName(product.category)}</span>
        </div>
      </div>

      {/*
        Stretched-link pattern: one overlay button makes the whole card activatable by
        mouse and keyboard without nesting headings inside a <button>, which the HTML
        content model forbids.
      */}
      {onOpen && (
        <button
          type="button"
          onClick={() => onOpen(product)}
          className="focus-ring absolute inset-0 rounded-xl"
        >
          <span className="sr-only">مشاهدهٔ جزئیات {product.name}</span>
        </button>
      )}
    </article>
  );
}

"use client";

import type { Product } from "@/types/product";
import { draftToPreview, type ProductDraft } from "@/lib/products/validation";
import { ProductCard } from "@/components/products/ProductCard";

export interface ProductPreviewPanelProps {
  draft: ProductDraft;
  base?: Product;
}

/**
 * Renders the *actual* public ProductCard with the in-progress form values, so the
 * preview can never drift from what customers see.
 */
export function ProductPreviewPanel({ draft, base }: ProductPreviewPanelProps) {
  const preview = draftToPreview(draft, base);

  return (
    <aside className="xl:sticky xl:top-6">
      <h2 className="text-sm font-semibold text-ink">پیش‌نمایش</h2>
      <p className="mt-1 mb-3 text-xs leading-6 text-ink-subtle">
        این محصول در صفحهٔ فروشگاه به این شکل دیده می‌شود.
      </p>
      <ProductCard product={preview} />
    </aside>
  );
}

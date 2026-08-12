"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Product } from "@/types/product";
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  type ProductsSnapshot,
} from "@/lib/products/store";

/** Subscribes to the shared catalogue. Used by both the public page and the admin panel. */
export function useProducts(): ProductsSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useProduct(id: string | undefined): {
  product: Product | null;
  snapshot: ProductsSnapshot;
} {
  const snapshot = useProducts();
  const product = useMemo(
    () => (id ? (snapshot.products.find((item) => item.id === id) ?? null) : null),
    [snapshot.products, id],
  );
  return { product, snapshot };
}

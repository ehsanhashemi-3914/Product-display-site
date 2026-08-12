import type { Product } from "@/types/product";

/** Shared row-action contract between the desktop table and the mobile card list. */
export interface ProductListActions {
  onDelete: (product: Product) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  /** Reordering is meaningless while a filter hides part of the list. */
  reorderEnabled: boolean;
  /** Id of the row currently being reordered, so its controls can show as busy. */
  busyId: string | null;
}

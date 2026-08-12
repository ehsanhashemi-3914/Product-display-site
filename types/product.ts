export type ProductStatus = "available" | "out_of_stock" | "preorder";

export interface ProductImage {
  id: string;
  /** Absolute http(s) URL or a client-generated data: URL. */
  url: string;
  alt: string;
}

/** Free-form "additional information" rows shown in the product quick-view. */
export interface ProductSpec {
  id: string;
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Base price in تومان, before any discount. */
  price: number;
  /** 0–100. The effective price is always derived, never stored twice. */
  discountPercent?: number;
  images: ProductImage[];
  category: CategoryId;
  status: ProductStatus;
  /** Short marketing label, e.g. «پرفروش». */
  badge?: string;
  specs: ProductSpec[];
  /** Manual sort position — lower comes first. */
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** Everything the user can edit. Identity and ordering are owned by the repository. */
export type ProductInput = Omit<
  Product,
  "id" | "order" | "createdAt" | "updatedAt"
>;

export const CATEGORY_IDS = [
  "torbat",
  "stone",
  "travel",
  "decorative",
  "bulk",
  "accessories",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface Category {
  id: CategoryId;
  name: string;
}

export const PRODUCT_STATUSES = [
  "available",
  "out_of_stock",
  "preorder",
] as const;

import type { Product, ProductInput } from "@/types/product";

/**
 * The seam between the UI and wherever products actually live.
 *
 * Every method is async even though today's implementation is synchronous
 * localStorage — that is the entire point. Dropping in an HTTP-backed
 * implementation later requires no changes above this line.
 */
export interface ProductRepository {
  list(): Promise<Product[]>;
  get(id: string): Promise<Product | null>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, patch: Partial<ProductInput>): Promise<Product>;
  remove(id: string): Promise<void>;
  /** Applies the given order; ids not present keep their relative position at the end. */
  reorder(orderedIds: string[]): Promise<Product[]>;
  /** Replaces the entire catalogue — used when restoring a backup file. */
  replaceAll(products: Product[]): Promise<Product[]>;
  /** Discards all local changes and restores the seed catalogue. */
  reset(): Promise<Product[]>;
}

export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`محصولی با شناسهٔ «${id}» یافت نشد.`);
    this.name = "ProductNotFoundError";
  }
}

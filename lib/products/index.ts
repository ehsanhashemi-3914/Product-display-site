import type { ProductRepository } from "./repository";
import { HttpProductRepository } from "./http-repository";

/**
 * ── The swap point ──────────────────────────────────────────────────────────
 * The single place that decides where products live.
 *
 * Products are now stored in Postgres and reached over /api/products, so every
 * visitor sees the same catalogue and nothing depends on one browser's storage.
 *
 * The previous localStorage implementation still exists in ./local-repository and
 * satisfies the same interface — switching back is one line, and neither switch
 * required touching a component, hook, page or service.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const productRepository: ProductRepository = new HttpProductRepository();

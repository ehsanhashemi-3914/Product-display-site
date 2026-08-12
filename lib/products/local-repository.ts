import {
  CATEGORY_IDS,
  PRODUCT_STATUSES,
  type CategoryId,
  type Product,
  type ProductImage,
  type ProductInput,
  type ProductSpec,
  type ProductStatus,
} from "@/types/product";
import { isBrowser, readJson, removeKey, writeJson } from "@/lib/storage/local-storage";
import { ProductNotFoundError, type ProductRepository } from "./repository";
import { SEED_PRODUCTS } from "./seed";

export const PRODUCTS_STORAGE_KEY = "mehr-ehsan:products:v1";

interface PersistedCatalogue {
  version: 1;
  products: unknown;
}

export function createId(prefix = "p"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** localStorage-backed catalogue. The only place in the app that persists products. */
export class LocalStorageProductRepository implements ProductRepository {
  async list(): Promise<Product[]> {
    return this.read();
  }

  async get(id: string): Promise<Product | null> {
    return this.read().find((product) => product.id === id) ?? null;
  }

  async create(input: ProductInput): Promise<Product> {
    const now = new Date().toISOString();
    const product: Product = {
      ...normalizeInput(input),
      id: createId(),
      order: -1, // sorted to the front, then renumbered below
      createdAt: now,
      updatedAt: now,
    };
    // New products land at the top so the owner sees the result of their work immediately.
    const next = sortAndRenumber([product, ...this.read()]);
    this.write(next);
    return next.find((item) => item.id === product.id) ?? product;
  }

  async update(id: string, patch: Partial<ProductInput>): Promise<Product> {
    const products = this.read();
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) throw new ProductNotFoundError(id);

    const normalized = normalizeInput({ ...products[index], ...patch });
    const merged: Product = {
      ...products[index],
      ...normalized,
      // Optional fields are *omitted* by normalizeInput when empty, and a spread that
      // omits a key leaves the previous value untouched — so clearing a discount or a
      // badge would silently do nothing. Assign them explicitly to allow "unset".
      discountPercent: normalized.discountPercent,
      badge: normalized.badge,
      updatedAt: new Date().toISOString(),
    };
    products[index] = merged;
    this.write(sortAndRenumber(products));
    return merged;
  }

  async remove(id: string): Promise<void> {
    const products = this.read();
    const next = products.filter((product) => product.id !== id);
    if (next.length === products.length) throw new ProductNotFoundError(id);
    this.write(sortAndRenumber(next));
  }

  async reorder(orderedIds: string[]): Promise<Product[]> {
    const products = this.read();
    const position = new Map(orderedIds.map((id, index) => [id, index]));
    const next = [...products].sort(
      (a, b) =>
        (position.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
        (position.get(b.id) ?? Number.MAX_SAFE_INTEGER),
    );
    const renumbered = sortAndRenumber(next, /* preserveArrayOrder */ true);
    this.write(renumbered);
    return renumbered;
  }

  async replaceAll(products: Product[]): Promise<Product[]> {
    const next = sortAndRenumber(
      products
        .map((product) => sanitizeProduct(product))
        .filter((product): product is Product => product !== null),
    );
    this.write(next);
    return next;
  }

  async reset(): Promise<Product[]> {
    removeKey(PRODUCTS_STORAGE_KEY);
    return this.read();
  }

  private read(): Product[] {
    const stored = readJson<PersistedCatalogue>(PRODUCTS_STORAGE_KEY);
    if (!stored || !Array.isArray(stored.products)) {
      // Unreadable data is stashed rather than dropped: the very next save would
      // otherwise overwrite a possibly-recoverable catalogue with the seed.
      preserveUnreadable();
      return cloneSeed();
    }

    const sanitized = stored.products
      .map((raw) => sanitizeProduct(raw))
      .filter((product): product is Product => product !== null);

    // An empty catalogue is a legitimate state (the owner deleted everything);
    // only unreadable data falls back to the seed.
    return sortAndRenumber(sanitized);
  }

  private write(products: Product[]): void {
    const payload: PersistedCatalogue = { version: 1, products };
    writeJson(PRODUCTS_STORAGE_KEY, payload);
  }
}

export const CORRUPT_BACKUP_KEY = `${PRODUCTS_STORAGE_KEY}:unreadable`;

/**
 * Copies stored-but-unparseable catalogue data aside before the app falls back to the
 * seed. Without this, one corrupt read followed by any save silently destroys whatever
 * was there — the difference between "recoverable" and "gone".
 */
function preserveUnreadable(): void {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return;
    if (window.localStorage.getItem(CORRUPT_BACKUP_KEY)) return;
    window.localStorage.setItem(CORRUPT_BACKUP_KEY, raw);
  } catch {
    // Best effort only — never block a render over this.
  }
}

function cloneSeed(): Product[] {
  return SEED_PRODUCTS.map((product) => ({
    ...product,
    images: product.images.map((image) => ({ ...image })),
    specs: product.specs.map((spec) => ({ ...spec })),
  }));
}

/** Sorts by `order` (then creation date) and rewrites `order` to a dense 0..n-1 range. */
function sortAndRenumber(products: Product[], preserveArrayOrder = false): Product[] {
  const sorted = preserveArrayOrder
    ? [...products]
    : [...products].sort(
        (a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt),
      );
  return sorted.map((product, index) => ({ ...product, order: index }));
}

function normalizeInput(input: ProductInput): ProductInput {
  const discount = clampNumber(input.discountPercent ?? 0, 0, 100);
  const badge = input.badge?.trim();
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    price: Math.max(0, Math.round(input.price)),
    ...(discount > 0 ? { discountPercent: discount } : {}),
    images: input.images
      .filter((image) => image.url.trim().length > 0)
      .map((image) => ({
        id: image.id || createId("img"),
        url: image.url.trim(),
        alt: image.alt.trim(),
      })),
    category: input.category,
    status: input.status,
    ...(badge ? { badge } : {}),
    specs: input.specs
      .filter((spec) => spec.label.trim() && spec.value.trim())
      .map((spec) => ({
        id: spec.id || createId("spec"),
        label: spec.label.trim(),
        value: spec.value.trim(),
      })),
  };
}

/**
 * Defensive read-side normalisation. Stored data can be stale (older app version),
 * hand-edited in devtools, or partially corrupt — anything unrecoverable is dropped
 * rather than allowed to crash a render.
 */
function sanitizeProduct(raw: unknown): Product | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.id !== "string" || typeof value.name !== "string") return null;

  const discount = clampNumber(toNumber(value.discountPercent), 0, 100);
  const badge = typeof value.badge === "string" ? value.badge.trim() : "";

  return {
    id: value.id,
    name: value.name,
    description: typeof value.description === "string" ? value.description : "",
    price: Math.max(0, Math.round(toNumber(value.price))),
    ...(discount > 0 ? { discountPercent: discount } : {}),
    images: sanitizeImages(value.images),
    category: toCategory(value.category),
    status: toStatus(value.status),
    ...(badge ? { badge } : {}),
    specs: sanitizeSpecs(value.specs),
    order: Number.isFinite(value.order) ? Number(value.order) : Number.MAX_SAFE_INTEGER,
    createdAt: toIso(value.createdAt),
    updatedAt: toIso(value.updatedAt),
  };
}

function sanitizeImages(raw: unknown): ProductImage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is Record<string, unknown> => typeof item === "object" && item !== null,
    )
    .filter((item) => typeof item.url === "string" && item.url.trim().length > 0)
    .map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : createId("img"),
      url: String(item.url).trim(),
      alt: typeof item.alt === "string" ? item.alt : "",
    }));
}

function sanitizeSpecs(raw: unknown): ProductSpec[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is Record<string, unknown> => typeof item === "object" && item !== null,
    )
    .filter((item) => typeof item.label === "string" && typeof item.value === "string")
    .map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : createId("spec"),
      label: String(item.label),
      value: String(item.value),
    }));
}

function toNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function toCategory(value: unknown): CategoryId {
  return CATEGORY_IDS.includes(value as CategoryId) ? (value as CategoryId) : CATEGORY_IDS[0];
}

function toStatus(value: unknown): ProductStatus {
  return PRODUCT_STATUSES.includes(value as ProductStatus)
    ? (value as ProductStatus)
    : "available";
}

function toIso(value: unknown): string {
  if (typeof value === "string" && !Number.isNaN(new Date(value).getTime())) return value;
  return new Date(0).toISOString();
}

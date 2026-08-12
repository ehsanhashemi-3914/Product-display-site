import type { Product } from "@/types/product";
import { productRepository } from "./index";

/**
 * A minimal external store powering `useSyncExternalStore`.
 *
 * Why not plain `useEffect` + state: both the public page and the admin panel need to
 * observe the *same* catalogue, and an edit in one must be visible in the other (and in
 * another browser tab) without a reload. One module-level store gives that for free.
 */

export type StoreStatus = "loading" | "ready" | "error";

export interface ProductsSnapshot {
  status: StoreStatus;
  /**
   * `seed` means "the browser hasn't fetched from the server yet". The public page falls
   * back to its server-rendered list during that window, and the admin shows skeletons.
   */
  source: "seed" | "store";
  products: readonly Product[];
  error: string | null;
}

const SERVER_SNAPSHOT: ProductsSnapshot = Object.freeze({
  status: "ready",
  source: "seed",
  products: Object.freeze([]) as readonly Product[],
  error: null,
});

/**
 * Held in a module variable and only ever *replaced*, never mutated: `useSyncExternalStore`
 * compares snapshots by reference, so returning a fresh object on every read would loop
 * forever. This is the single most important invariant in this file.
 */
let snapshot: ProductsSnapshot = SERVER_SNAPSHOT;

const listeners = new Set<() => void>();
let started = false;
let inFlight: Promise<void> | null = null;

export function getSnapshot(): ProductsSnapshot {
  return snapshot;
}

export function getServerSnapshot(): ProductsSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

/** Re-reads the catalogue from the repository and notifies every subscriber. */
export async function refresh(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const products = await productRepository.list();
      setSnapshot({ status: "ready", source: "store", products, error: null });
    } catch (error) {
      setSnapshot({
        status: "error",
        source: "store",
        products: [],
        error: toErrorMessage(error),
      });
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "خطای ناشناخته‌ای رخ داد.";
}

function setSnapshot(next: ProductsSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

/** Kicked off by the first subscriber. */
function start(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  void refresh();
}

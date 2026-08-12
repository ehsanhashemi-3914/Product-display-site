import type { Product, ProductInput } from "@/types/product";
import { ProductNotFoundError, type ProductRepository } from "./repository";

/**
 * Talks to /api/products. Implements exactly the same interface the localStorage version
 * did, which is why swapping storage engines touches no component, hook, page or service.
 */

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
    headers: init?.body ? { "content-type": "application/json", ...init?.headers } : init?.headers,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // A non-JSON body (gateway error page) still needs a readable message below.
  }

  if (!response.ok) {
    const message =
      (payload as { error?: string } | null)?.error ??
      `درخواست ناموفق بود (کد ${response.status}).`;
    throw new Error(message);
  }
  return payload as T;
}

export class HttpProductRepository implements ProductRepository {
  async list(): Promise<Product[]> {
    const { products } = await request<{ products: Product[] }>("/api/products");
    return products;
  }

  async get(id: string): Promise<Product | null> {
    try {
      const { product } = await request<{ product: Product }>(
        `/api/products/${encodeURIComponent(id)}`,
      );
      return product;
    } catch {
      return null;
    }
  }

  async create(input: ProductInput): Promise<Product> {
    const { product } = await request<{ product: Product }>("/api/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return product;
  }

  async update(id: string, patch: Partial<ProductInput>): Promise<Product> {
    const { product } = await request<{ product: Product }>(
      `/api/products/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(patch) },
    );
    if (!product) throw new ProductNotFoundError(id);
    return product;
  }

  async remove(id: string): Promise<void> {
    await request<{ ok: true }>(`/api/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  async reorder(orderedIds: string[]): Promise<Product[]> {
    const { products } = await request<{ products: Product[] }>(
      "/api/products/reorder",
      { method: "POST", body: JSON.stringify({ orderedIds }) },
    );
    return products;
  }

  async replaceAll(products: Product[]): Promise<Product[]> {
    const result = await request<{ products: Product[] }>("/api/products/restore", {
      method: "POST",
      body: JSON.stringify({ products }),
    });
    return result.products;
  }

  async reset(): Promise<Product[]> {
    const { products } = await request<{ products: Product[] }>(
      "/api/products/restore",
      { method: "POST", body: JSON.stringify({ reset: true }) },
    );
    return products;
  }
}

import type { Product, ProductInput } from "@/types/product";
import { productRepository } from "./index";
import { refresh } from "./store";

/**
 * The only API components are allowed to call for mutations.
 *
 * Every method writes through the repository and then refreshes the shared store, which
 * is what keeps the public page and the admin panel in sync off one dataset.
 */
export const productService = {
  async create(input: ProductInput): Promise<Product> {
    const product = await productRepository.create(input);
    await refresh();
    return product;
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    const product = await productRepository.update(id, input);
    await refresh();
    return product;
  },

  async remove(id: string): Promise<void> {
    await productRepository.remove(id);
    await refresh();
  },

  /** Swaps a product with its neighbour. No-op at the ends of the list. */
  async move(id: string, direction: "up" | "down"): Promise<void> {
    const products = await productRepository.list();
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) return;

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= products.length) return;

    const ids = products.map((product) => product.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await productRepository.reorder(ids);
    await refresh();
  },

  /** Replaces the whole catalogue with a restored backup. */
  async restore(products: Product[]): Promise<Product[]> {
    const restored = await productRepository.replaceAll(products);
    await refresh();
    return restored;
  },

  async resetToSeed(): Promise<void> {
    await productRepository.reset();
    await refresh();
  },

  get(id: string): Promise<Product | null> {
    return productRepository.get(id);
  },
};

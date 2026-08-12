import type { Product } from "@/types/product";
import { listProducts } from "@/lib/db/products-db";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SiteFooter } from "@/components/products/SiteFooter";
import { SiteHeader } from "@/components/products/SiteHeader";

// The catalogue is edited from the admin panel, so a visitor must always get the
// current list rather than a copy cached at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products: Product[] = [];
  try {
    // Read straight from the database: customers and search engines get the real
    // catalogue in the very first response, without waiting for any JavaScript.
    products = await listProducts();
  } catch (error) {
    // A misconfigured database must not take the whole shop page down — the header,
    // contact details and footer still have value.
    console.error("[home] could not load products", error);
  }

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <h2 className="mb-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
          محصولات
        </h2>
        <ProductGrid initialProducts={products} />
      </main>

      <SiteFooter />
    </>
  );
}

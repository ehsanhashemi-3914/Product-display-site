import { NextResponse } from "next/server";
import type { Product } from "@/types/product";
import { replaceAllProducts, resetProductsToSeed } from "@/lib/db/products-db";
import { parseProductInput } from "@/lib/products/validate-input";
import { jsonError, requireAdmin, serverErrorResponse } from "@/lib/api/guards";

export const dynamic = "force-dynamic";

/**
 * Restores a backup file, or resets to the sample catalogue when `reset` is true.
 * Every incoming product is re-validated — a backup file is user-supplied input.
 */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as { products?: unknown; reset?: unknown };

    if (body.reset === true) {
      return NextResponse.json({ products: await resetProductsToSeed() });
    }

    if (!Array.isArray(body.products)) {
      return jsonError("فهرست محصولات در داده‌های ارسالی پیدا نشد.", 400);
    }

    const now = new Date().toISOString();
    const products: Product[] = [];

    for (const [index, raw] of body.products.entries()) {
      const parsed = parseProductInput(raw);
      if (!parsed.ok) {
        return jsonError(`محصول ردیف ${index + 1}: ${parsed.error}`, 400);
      }
      const source = raw as Partial<Product>;
      products.push({
        ...parsed.value,
        id: typeof source.id === "string" && source.id ? source.id : `p-${crypto.randomUUID()}`,
        order: index,
        createdAt: isIsoDate(source.createdAt) ? source.createdAt : now,
        updatedAt: isIsoDate(source.updatedAt) ? source.updatedAt : now,
      });
    }

    return NextResponse.json({ products: await replaceAllProducts(products) });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

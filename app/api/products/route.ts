import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/db/products-db";
import { parseProductInput } from "@/lib/products/validate-input";
import { jsonError, requireAdmin, serverErrorResponse } from "@/lib/api/guards";

// The catalogue changes whenever the owner edits it, so never serve a cached copy.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(
      { products: await listProducts() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const parsed = parseProductInput(await request.json());
    if (!parsed.ok) return jsonError(parsed.error, 400);

    const product = await createProduct(parsed.value);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

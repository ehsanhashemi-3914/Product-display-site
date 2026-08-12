import { NextResponse } from "next/server";
import { deleteProduct, getProduct, updateProduct } from "@/lib/db/products-db";
import { parseProductInput } from "@/lib/products/validate-input";
import { jsonError, requireAdmin, serverErrorResponse } from "@/lib/api/guards";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) return jsonError("محصول یافت نشد.", 404);
    return NextResponse.json({ product }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const parsed = parseProductInput(await request.json());
    if (!parsed.ok) return jsonError(parsed.error, 400);

    const product = await updateProduct(id, parsed.value);
    if (!product) return jsonError("محصول یافت نشد.", 404);
    return NextResponse.json({ product });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const removed = await deleteProduct(id);
    if (!removed) return jsonError("محصول یافت نشد.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

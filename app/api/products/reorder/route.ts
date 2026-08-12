import { NextResponse } from "next/server";
import { reorderProducts } from "@/lib/db/products-db";
import { jsonError, requireAdmin, serverErrorResponse } from "@/lib/api/guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as { orderedIds?: unknown };
    const orderedIds = Array.isArray(body.orderedIds)
      ? body.orderedIds.filter((id): id is string => typeof id === "string")
      : null;

    if (!orderedIds || orderedIds.length === 0) {
      return jsonError("ترتیب ارسالی معتبر نیست.", 400);
    }

    return NextResponse.json({ products: await reorderProducts(orderedIds) });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

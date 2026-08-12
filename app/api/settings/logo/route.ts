import { NextResponse } from "next/server";
import { getSetting, LOGO_SETTING_KEY, setSetting } from "@/lib/db/media-db";
import { jsonError, requireAdmin, serverErrorResponse } from "@/lib/api/guards";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(
      { logo: await getSetting(LOGO_SETTING_KEY) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as { logo?: unknown };
    const logo = body.logo;

    if (logo !== null && typeof logo !== "string") {
      return jsonError("مقدار لوگو معتبر نیست.", 400);
    }
    // Only paths we serve ourselves, so the logo can't be pointed at a third-party tracker.
    if (typeof logo === "string" && !logo.startsWith("/api/images/")) {
      return jsonError("آدرس لوگو معتبر نیست.", 400);
    }

    await setSetting(LOGO_SETTING_KEY, logo);
    return NextResponse.json({ logo });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

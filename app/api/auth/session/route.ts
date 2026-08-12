import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/api/guards";

/** Lets the admin shell decide between the login screen and the panel. */
export async function GET() {
  return NextResponse.json(
    { authenticated: await isAuthenticated() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

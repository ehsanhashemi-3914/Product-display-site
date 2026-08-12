import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/** Shared JSON error shape so the client can always read `error`. */
export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Guards every mutating endpoint. Returns a response to send back when the caller is not
 * signed in, or null when the request may proceed.
 *
 * This is the real security boundary — unlike the old browser-side check, it cannot be
 * bypassed by editing client code, because the check happens on the server.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAuthenticated()) return null;
  return jsonError("برای این کار باید وارد پنل مدیریت شوید.", 401);
}

export function serverErrorResponse(error: unknown): NextResponse {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "خطای ناشناخته‌ای در سرور رخ داد.";
  console.error("[api]", error);
  return jsonError(message, 500);
}

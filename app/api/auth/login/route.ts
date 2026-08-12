import { NextResponse } from "next/server";
import {
  createSessionToken,
  passwordMatches,
  REMEMBERED_TTL_MS,
  SESSION_COOKIE,
  SESSION_TTL_MS,
} from "@/lib/auth/session";
import { jsonError, serverErrorResponse } from "@/lib/api/guards";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: unknown; remember?: unknown };
    const password = typeof body.password === "string" ? body.password : "";
    const remember = body.remember === true;

    if (!password) return jsonError("رمز عبور را وارد کنید.", 400);
    if (!passwordMatches(password)) {
      // Deliberately vague and uniform, so the response can't be used to probe.
      return jsonError("رمز عبور نادرست است.", 401);
    }

    const maxAge = remember ? REMEMBERED_TTL_MS : SESSION_TTL_MS;
    const token = await createSessionToken(maxAge);

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true, // unreadable from JavaScript, so XSS can't steal the session
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(maxAge / 1000),
    });
    return response;
  } catch (error) {
    return serverErrorResponse(error);
  }
}

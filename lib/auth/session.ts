/**
 * Admin session tokens.
 *
 * Uses Web Crypto (not node:crypto) so the identical code runs in route handlers and in
 * middleware, where the Node crypto module is unavailable.
 *
 * The signing key is derived from AUTH_SECRET *and* the admin password, so changing the
 * password automatically invalidates every existing session everywhere — no separate
 * revocation step to forget.
 */

export const SESSION_COOKIE = "mehr_admin";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const REMEMBERED_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const encoder = new TextEncoder();

export class AuthNotConfiguredError extends Error {
  constructor(missing: string) {
    super(`متغیر ${missing} تنظیم نشده است. فایل .env.local را کامل کنید.`);
    this.name = "AuthNotConfiguredError";
  }
}

export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new AuthNotConfiguredError("ADMIN_PASSWORD");
  return password;
}

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new AuthNotConfiguredError("AUTH_SECRET");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(`${secret}:${getAdminPassword()}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createSessionToken(ttlMs: number): Promise<string> {
  const payload = String(Date.now() + ttlMs);
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const provided = token.slice(separator + 1);

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  try {
    const key = await getKey();
    const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    return timingSafeEquals(provided, toBase64Url(expected));
  } catch {
    // Missing configuration must fail closed, never open.
    return false;
  }
}

/** Length-independent compare so a signature can't be probed byte by byte. */
function timingSafeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function passwordMatches(candidate: string): boolean {
  const expected = getAdminPassword();
  if (candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Admin session state, mirrored from the server.
 *
 * The real check lives in an httpOnly cookie the browser cannot read, so this store only
 * reflects "is the server treating me as signed in" — it never decides it. Tampering with
 * anything here changes nothing, because every write endpoint re-checks the cookie.
 */

export type AdminSessionStatus = "checking" | "locked" | "unlocked";

let status: AdminSessionStatus = "checking";
const listeners = new Set<() => void>();
let started = false;

export function getAdminSessionSnapshot(): AdminSessionStatus {
  return status;
}

export function getAdminSessionServerSnapshot(): AdminSessionStatus {
  return "checking";
}

export function subscribeToAdminSession(listener: () => void): () => void {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

export async function unlockAdmin(
  password: string,
  remember: boolean,
): Promise<{ ok: true } | { ok: false; error: string; wrongPassword: boolean }> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password, remember }),
  });

  if (!response.ok) {
    let error = "ورود ناموفق بود.";
    try {
      error = ((await response.json()) as { error?: string }).error ?? error;
    } catch {
      // Keep the generic message when the body isn't JSON.
    }
    // 401 means the password itself was rejected. Anything else (a missing environment
    // variable, a database outage) is not the typist's fault, so their input is kept.
    return { ok: false, error, wrongPassword: response.status === 401 };
  }

  setStatus("unlocked");
  return { ok: true };
}

export async function lockAdmin(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  } finally {
    // Reflect the logout locally even if the request failed — the cookie may already be gone.
    setStatus("locked");
  }
}

async function refresh(): Promise<void> {
  try {
    const response = await fetch("/api/auth/session", {
      credentials: "same-origin",
      cache: "no-store",
    });
    const data = (await response.json()) as { authenticated?: boolean };
    setStatus(data.authenticated ? "unlocked" : "locked");
  } catch {
    setStatus("locked");
  }
}

function setStatus(next: AdminSessionStatus): void {
  if (status === next) return;
  status = next;
  for (const listener of listeners) listener();
}

function start(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  void refresh();
  // Coming back to a tab after the session expired should show the login screen.
  window.addEventListener("focus", () => void refresh());
}

/**
 * SSR-safe, versioned, quota-aware wrapper around `window.localStorage`.
 *
 * Nothing outside `lib/` should import this — components talk to the product service,
 * which talks to a repository, which is the only thing that touches storage. That
 * indirection is what makes the localStorage → HTTP swap a one-file change.
 */

export class StorageUnavailableError extends Error {
  constructor(message = "حافظهٔ مرورگر در دسترس نیست.") {
    super(message);
    this.name = "StorageUnavailableError";
  }
}

export class StorageQuotaError extends Error {
  constructor(
    message = "فضای حافظهٔ مرورگر پر شده است. تصاویر کمتری اضافه کنید یا از آدرس اینترنتی تصویر استفاده کنید.",
  ) {
    super(message);
    this.name = "StorageQuotaError";
  }
}

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Returns `null` on the server, for a missing key, or for unparseable JSON. */
export function readJson<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupt or unreadable payload — treat it as absent rather than crashing the app.
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) throw new StorageUnavailableError();
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (isQuotaError(error)) throw new StorageQuotaError();
    throw new StorageUnavailableError();
  }
}

export function removeKey(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing useful to do — the value is already unreachable.
  }
}

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22
  );
}
